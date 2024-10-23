import { and, eq, like, SQL } from 'drizzle-orm';
import { ServiceError } from '@getcronit/pylon';

import getDb from '../db';
import { Airport, airports } from '../db/schema';
import {
    checkEditSecret,
    generateUUID,
    isValidUUID,
    validateName,
    validatePagination,
} from '../utils';

/**
 * Get airport by ICAO code (internal)
 * @param icao  The ICAO code of the airport
 * @returns     The airport
 */
async function $getAirportByICAO(icao: string) {
    return await getDb().query.airports.findFirst({
        where: eq(airports.icao, icao),
    });
}

/**
 * Get airports
 * @param icao      The ICAO code
 * @param name      The name
 * @param country   The country
 * @param take      The number of airports to take
 * @param skip      The number of airports to skip
 * @returns         Array of airports
 */
export async function getAirports(
    icao?: string,
    name?: string,
    country?: string,
    take?: number,
    skip?: number,
) {
    validatePagination(take, skip);

    const conditions: SQL[] = [];
    if (icao) conditions.push(like(airports.icao, `${icao.trim()}%`));
    if (name) conditions.push(like(airports.name, `${name.trim()}%`));
    if (country) conditions.push(like(airports.country, `${country.trim()}%`));

    try {
        return await getDb().query.airports.findMany({
            limit: take ?? 20,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined,
            columns: {
                id: false,
            },
        });
    } catch (error) {
        throw new ServiceError('Failed to get airports', {
            statusCode: 500,
            code: 'db_error',
        });
    }
}

/**
 * Get airport by either uuid or ICAO code
 * @param id    The uuid of the airport
 * @param icao  The ICAO code of the airport
 * @returns     The airport
 */
export async function getAirportById(id?: string, icao?: string) {
    if (!id && !icao) {
        throw new ServiceError('Invalid parameters', {
            statusCode: 400,
            code: 'invalid_parameters',
            details: {
                id,
                icao,
                description: 'Either id or icao must be provided',
            },
        });
    } else if (id && icao) {
        throw new ServiceError('Invalid parameters', {
            statusCode: 400,
            code: 'invalid_parameters',
            details: {
                id,
                icao,
                description: 'Only one of id or icao must be provided',
            },
        });
    }

    if (id) {
        if (!isValidUUID(id)) {
            throw new ServiceError('Invalid uuid', {
                statusCode: 400,
                code: 'invalid_uuid',
                details: {
                    id,
                },
            });
        }

        return await getDb().query.airports.findFirst({
            where: eq(airports.id, id),
        });
    }

    const icaoInput = icao!.trim();
    if (icaoInput.length !== 4) {
        throw new ServiceError('Invalid ICAO code', {
            statusCode: 400,
            code: 'invalid_icao',
            details: {
                icao,
                description: 'The ICAO code must be exactly 4 characters',
            },
        });
    }

    return await $getAirportByICAO(icaoInput); // ICAO is defined at this point
}

/**
 * Add airport
 * @param icao      The ICAO code
 * @param name      The name
 * @param country   The country
 * @returns         The added airport
 */
export async function addAirport(icao: string, name: string, country: string) {
    icao = icao.trim().toLocaleUpperCase();
    if (icao.length !== 4) {
        throw new ServiceError('Invalid ICAO code', {
            statusCode: 400,
            code: 'invalid_icao',
            details: {
                icao,
                description: 'The ICAO code must be exactly 4 characters',
            },
        });
    }
    const isIcaoOccupied = !!(await $getAirportByICAO(icao));
    if (isIcaoOccupied) {
        throw new ServiceError('Airport already exists', {
            statusCode: 400,
            code: 'airport_exists',
            details: {
                icao,
                description:
                    'An airport with the same ICAO code already exists',
            },
        });
    }

    name = name.trim();
    validateName(name, 'name', 5);

    country = country.trim();
    validateName(country, 'country', 5);

    try {
        const [airport] = await getDb()
            .insert(airports)
            .values({
                id: generateUUID(),
                icao,
                name,
                country,
            })
            .returning();

        return airport;
    } catch (error) {
        throw new ServiceError('Failed to add airport', {
            statusCode: 500,
            code: 'db_error',
        });
    }
}

/**
 * Update airport
 * @param id        The id of the airport
 * @param icao      The ICAO code
 * @param name      The name
 * @param country   The country
 * @returns         The updated airport
 */
export async function updateAirport(
    id: string,
    icao?: string,
    name?: string,
    country?: string,
) {
    const existsAirport = !!(await getAirportById(id));
    if (!existsAirport) {
        throw new ServiceError('Airport not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                id,
            },
        });
    }

    const values: Partial<Airport> = {};

    const icaoInput = icao?.trim().toLocaleUpperCase();
    if (icaoInput !== undefined) {
        if (icaoInput.length !== 4) {
            throw new ServiceError('Invalid ICAO code', {
                statusCode: 400,
                code: 'invalid_icao',
                details: {
                    icao,
                    description: 'The ICAO code must be exactly 4 characters',
                },
            });
        }

        const existingIcaoAirport = await $getAirportByICAO(icaoInput);
        if (existingIcaoAirport && existingIcaoAirport.id !== id) {
            throw new ServiceError('Airport already exists', {
                statusCode: 400,
                code: 'airport_exists',
                details: {
                    icao,
                    description:
                        'An airport with the same ICAO code already exists',
                },
            });
        }
        values.icao = icaoInput;
    }

    if (name !== undefined) {
        const nameInput = name.trim();
        validateName(name, 'name', 5);
        values.name = nameInput;
    }

    if (country !== undefined) {
        const countryInput = country.trim();
        validateName(country, 'country', 5);

        values.country = countryInput;
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No update values provided', {
            statusCode: 400,
            code: 'invalid_data',
        });
    }

    try {
        const [updatedAirport] = await getDb()
            .update(airports)
            .set(values)
            .where(eq(airports.id, id))
            .returning();

        return updatedAirport;
    } catch (error) {
        throw new ServiceError('Failed to update airport', {
            statusCode: 500,
            code: 'db_error',
        });
    }
}

/**
 * Delete airport
 * @param id        The id of the airport
 * @returns         The deleted airport
 */
export async function deleteAirport(id: string) {
    const existsAirport = !!(await getAirportById(id));
    if (!existsAirport) {
        throw new ServiceError('Airport not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                id,
            },
        });
    }

    try {
        const [deletedAirport] = await getDb()
            .delete(airports)
            .where(eq(airports.id, id))
            .returning();

        return deletedAirport;
    } catch (error) {
        throw new ServiceError('Failed to delete airport', {
            statusCode: 500,
            code: 'db_error',
        });
    }
}
