import { and, eq, like, SQL } from 'drizzle-orm';
import { ServiceError } from '@getcronit/pylon';

import getDb from '../db';
import { Airport, airports } from '../db/schema';
import { checkEditSecret, generateUUID, isValidUUID } from '../utils';

/**
 * Get airport by id (internal)
 * @param id    The id of the airport
 * @returns     The airport, or undefined if not found
 */
async function $getAirportById(id: number) {
    return await getDb().query.airports.findFirst({
        where: eq(airports.id, id),
    });
}

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
    if ((take !== undefined && take < 0) || (skip !== undefined && skip < 0)) {
        throw new ServiceError('Invalid pagination', {
            statusCode: 400,
            code: 'invalid_pagination',
            details: {
                take,
                skip,
            },
        });
    }

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
            where: eq(airports.uuid, id),
        });
    }

    return await $getAirportByICAO(icao!); // ICAO is defined at this point
}

/**
 * Add airport
 * @param secret    The secret to authorize the operation
 * @param icao      The ICAO code
 * @param name      The name
 * @param country   The country
 * @returns         The added airport
 */
export async function addAirport(
    secret: string,
    icao: string,
    name: string,
    country: string,
) {
    const icaoInput = icao.trim().toLocaleUpperCase();
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
    const existsIcaoAirport = !!(await $getAirportByICAO(icaoInput));
    if (existsIcaoAirport) {
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

    const nameInput = name.trim();
    if (name.length < 5 || name.length > 100) {
        throw new ServiceError('Invalid name', {
            statusCode: 400,
            code: 'invalid_name',
            details: {
                name,
                description: 'The name must be between 5 and 100 characters',
            },
        });
    }

    const countryInput = country.trim();
    if (countryInput.length < 5 || countryInput.length > 100) {
        throw new ServiceError('Invalid country', {
            statusCode: 400,
            code: 'invalid_country',
            details: {
                country,
                description: 'The country must be between 5 and 100 characters',
            },
        });
    }

    if (!secret) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    try {
        const [airport] = await getDb()
            .insert(airports)
            .values({
                uuid: generateUUID(),
                icao: icaoInput,
                name: nameInput,
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
 * @param secret    The secret to authorize the operation
 * @param id        The id of the airport
 * @param icao      The ICAO code
 * @param name      The name
 * @param country   The country
 * @returns         The updated airport
 */
export async function updateAirport(
    secret: string,
    id: number,
    icao?: string,
    name?: string,
    country?: string,
) {
    if (!secret) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existsAirport = !!(await $getAirportById(id));
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

    if (icao !== undefined) {
        const icaoInput = icao.trim().toLocaleUpperCase();
        if (icaoInput && icaoInput.length !== 4) {
            throw new ServiceError('Invalid ICAO code', {
                statusCode: 400,
                code: 'invalid_icao',
                details: {
                    icao,
                    description: 'The ICAO code must be exactly 4 characters',
                },
            });
        }

        const existsIcaoAirport = !!(await $getAirportByICAO(icaoInput));
        if (existsIcaoAirport) {
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
        if (nameInput && (nameInput.length < 5 || nameInput.length > 100)) {
            throw new ServiceError('Invalid name', {
                statusCode: 400,
                code: 'invalid_name',
                details: {
                    name,
                    description:
                        'The name must be between 5 and 100 characters',
                },
            });
        }

        values.name = nameInput;
    }

    if (country !== undefined) {
        const countryInput = country.trim();
        if (
            countryInput &&
            (countryInput.length < 5 || countryInput.length > 100)
        ) {
            throw new ServiceError('Invalid country', {
                statusCode: 400,
                code: 'invalid_country',
                details: {
                    country,
                    description:
                        'The country must be between 5 and 100 characters',
                },
            });
        }

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
 * @param secret    The secret to authorize the operation
 * @param id        The id of the airport
 * @returns         The deleted airport
 */
export async function deleteAirport(secret: string, id: number) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existsAirport = !!(await $getAirportById(id));
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
