import { and, eq, exists, like, SQL } from 'drizzle-orm';
import { ServiceError } from '@getcronit/pylon';

import getDb from '../db';
import { Airline, airlines } from '../db/schema';
import {
    generateUUID,
    isValidUUID,
    validateName,
    validatePagination,
} from '../utils';
import { DEFAULT_TAKE } from '../constants';

/**
 * Get airline by name (internal)
 * @param name  The name of the airline
 * @returns     The airline, or undefined if not found
 */
export async function $getAirlineByName(name: string) {
    return getDb().query.airlines.findFirst({
        where: eq(airlines.name, name),
    });
}

/**
 * Get airline by name
 * @param name  The name of the airline
 * @param take  The number of airlines to take
 * @param skip  The number of airlines to skip
 * @returns     Array of airlines
 */
export async function getAirlines(name?: string, take?: number, skip?: number) {
    validatePagination(take, skip);

    const conditions: SQL[] = [];

    if (name) conditions.push(like(airlines.name, `${name.trim()}%`));

    try {
        return await getDb().query.airlines.findMany({
            limit: take ?? DEFAULT_TAKE,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined,
            columns: {
                id: false,
            },
            with: {
                flights: {
                    columns: {
                        id: false,
                        aircraftId: false,
                        airlineId: false,
                        arrivalAirportId: false,
                        departureAirportId: false,
                        copilotId: false,
                        pilotId: false,
                    },
                    with: {
                        aircraft: {
                            columns: {
                                id: false,
                            },
                        },
                        airline: {
                            columns: {
                                id: false,
                            },
                        },
                        arrivalAirport: {
                            columns: {
                                id: false,
                            },
                        },
                        departureAirport: {
                            columns: {
                                id: false,
                            },
                        },
                        copilot: {
                            columns: {
                                id: false,
                            },
                        },
                        pilot: {
                            columns: {
                                id: false,
                            },
                        },
                    },
                },
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get airlines', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get airline by uuid
 * @param id    The uuid of the airline
 * @returns     The airline
 */
export async function getAirlineById(id: string) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid uuid', {
            statusCode: 400,
            code: 'invalid_uuid',
            details: {
                id,
            },
        });
    }

    try {
        return await getDb().query.airlines.findFirst({
            where: eq(airlines.id, id),
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get airline', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add airline
 * @param name      The name of the airline
 * @returns         The airline
 */
export async function addAirline(name: string) {
    name = name.trim();
    validateName(name, 'name', 5);

    const existsAirline = !!(await $getAirlineByName(name));
    if (existsAirline) {
        throw new ServiceError('Airline already exists', {
            statusCode: 400,
            code: 'airline_exists',
            details: {
                name,
                description: 'The airline with the same name already exists',
            },
        });
    }

    try {
        const [airline] = await getDb()
            .insert(airlines)
            .values({
                id: generateUUID(),
                name,
            })
            .returning();

        return airline;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to add airline', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Update airline
 * @param id        The id of the airline
 * @param name      The name of the airline
 * @returns         The updated airline
 */
export async function updateAirline(id: string, name?: string) {
    const existingAirline = await getAirlineById(id);
    if (!existingAirline) {
        throw new ServiceError('Airline does not exist', {
            statusCode: 400,
            code: 'airline_does_not_exist',
            details: {
                id,
            },
        });
    }

    const values: Partial<Airline> = {};

    if (name !== undefined) {
        name = name.trim();
        validateName(name, 'name', 5);

        const existsAirline = !!(await $getAirlineByName(name));
        if (existsAirline) {
            throw new ServiceError('Airline already exists', {
                statusCode: 400,
                code: 'airline_exists',
                details: {
                    name,
                    description:
                        'The airline with the same name already exists',
                },
            });
        }
        values.name = name;
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No values to update', {
            statusCode: 400,
            code: 'no_values',
        });
    }

    try {
        const [airline] = await getDb()
            .update(airlines)
            .set(values)
            .where(eq(airlines.id, id))
            .returning();

        return airline;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to update airline', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete airline
 * @param id        The id of the airline
 * @returns         The deleted airline
 */
export async function deleteAirline(id: string) {
    const existsAirline = !!(await getAirlineById(id));
    if (!existsAirline) {
        throw new ServiceError('Airline not found', {
            statusCode: 404,
            code: 'airline_not_found',
            details: {
                id,
            },
        });
    }

    try {
        const [airline] = await getDb()
            .delete(airlines)
            .where(eq(airlines.id, id))
            .returning();
        return airline;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to delete airline', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}
