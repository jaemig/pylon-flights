import { ServiceError } from '@getcronit/pylon';
import { eq, like } from 'drizzle-orm';

import getDb from '../db';
import { Aircraft, aircrafts } from '../db/schema';
import {
    generateUUID,
    isValidUUID,
    validateName,
    validatePagination,
} from '../utils';
import { DEFAULT_TAKE } from '../constants';

/**
 * Get aircraft by ICAO code
 * @param icao  The ICAO code of the aircraft
 * @returns     The aircraft
 */
async function $getAircraftByICAO(icao: string) {
    return await getDb()
        .query.aircrafts.findFirst({
            where: eq(aircrafts.icao, icao),
        })
        .catch(() => undefined);
}

/**
 * Get aircrafts
 * @param model  The model name of the aircraft
 * @param take  The number of aircrafts to take
 * @param skip  The number of aircrafts to skip
 * @returns     Array of aircrafts
 */
export async function getAircrafts(
    model?: string,
    take?: number,
    skip?: number,
) {
    validatePagination(take, skip);

    const filterModel = model?.trim().toLocaleLowerCase();
    try {
        return await getDb().query.aircrafts.findMany({
            limit: take ?? DEFAULT_TAKE,
            offset: skip,
            where:
                filterModel || false
                    ? like(aircrafts.model, `${filterModel}%`)
                    : undefined,
            columns: {
                id: false,
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get aircrafts', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get aircraft by id
 * @param id    The id of the aircraft
 * @returns     The aircraft or undefined if not found
 */
export async function getAircraftById(id: string) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid aircraft id', {
            statusCode: 400,
            code: 'invalid_aircraft_id',
            details: {
                id,
                description: 'The aircraft id must be a valid UUID',
            },
        });
    }

    try {
        return await getDb().query.aircrafts.findFirst({
            where: eq(aircrafts.id, id),
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add a new aircraft
 * @param icao      The ICAO code of the aircraft
 * @param model     The model name of the aircraft
 * @returns         The added aircraft
 */
export async function addAircraft(icao: string, model: string) {
    const icaoInput = icao.trim().toLocaleUpperCase();
    if (icaoInput.length !== 4) {
        throw new ServiceError('Invalid ICAO code', {
            statusCode: 400,
            code: 'invalid_icao_code',
            details: {
                icao,
                expectedLength: 4,
                description: 'The ICAO code must be 4 characters long',
            },
        });
    }

    model = model.trim();
    validateName(model, 'model', 5);

    const existingAircraft = await $getAircraftByICAO(icao);
    if (existingAircraft) {
        throw new ServiceError('Aircraft already exists', {
            statusCode: 400,
            code: 'aircraft_exists',
            details: {
                icao,
                description:
                    'An aircraft with the same ICAO code already exists',
            },
        });
    }

    try {
        const [aircraft] = await getDb()
            .insert(aircrafts)
            .values({
                id: generateUUID(),
                icao,
                model,
            })
            .returning();

        return aircraft;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to add aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Update aircraft by id
 * @param id        The id of the aircraft
 * @param icao      The ICAO code of the aircraft
 * @param model     The model name of the aircraft
 * @returns         The updated aircraft
 */
export async function updateAircraft(
    id: string,
    icao?: string,
    model?: string,
) {
    const values: Partial<Aircraft> = {};

    if (icao !== undefined) {
        icao = icao.trim().toLocaleUpperCase();
        if (icao.length !== 4) {
            throw new ServiceError('Invalid ICAO code', {
                statusCode: 400,
                code: 'invalid_icao_code',
                details: {
                    icao,
                    expectedLength: 4,
                    description: 'The ICAO code must be 4 characters long',
                },
            });
        }

        const existingAircraft = await $getAircraftByICAO(icao);
        if (existingAircraft && existingAircraft.id !== id) {
            throw new ServiceError('Aircraft already exists', {
                statusCode: 400,
                code: 'aircraft_exists',
                details: {
                    icao,
                    description:
                        'An aircraft with the same ICAO code already exists',
                },
            });
        }

        // Only update the ICAO code if it's different or is not assigned to any aircraft
        if (!existingAircraft || existingAircraft.icao !== icao) {
            values.icao = icao;
        }
    }

    const aircraft = await getAircraftById(id);
    if (!aircraft) {
        throw new ServiceError('Aircraft not found', {
            statusCode: 404,
            code: 'aircraft_not_found',
            details: {
                id,
            },
        });
    }

    if (model !== undefined) {
        model = model.trim();
        validateName(model, 'model', 5);

        values.model = model;
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No update values provided', {
            statusCode: 400,
            code: 'invalid_data',
        });
    }

    try {
        const [updatedAircraft] = await getDb()
            .update(aircrafts)
            .set(values)
            .where(eq(aircrafts.id, id))
            .returning();

        return updatedAircraft;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to update aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete aircraft by id
 * @param secret    The secret to authorize the operation
 * @param id        The id of the aircraft
 * @returns         The deleted aircraft
 */
export async function deleteAircraft(id: string) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid aircraft id', {
            statusCode: 400,
            code: 'invalid_aircraft_id',
            details: {
                id,
                description: 'The aircraft id must be a valid UUID',
            },
        });
    }

    const aircraft = await getAircraftById(id);
    if (!aircraft) {
        throw new ServiceError('Aircraft not found', {
            statusCode: 404,
            code: 'aircraft_not_found',
            details: {
                id,
            },
        });
    }

    try {
        return await getDb()
            .delete(aircrafts)
            .where(eq(aircrafts.id, id))
            .returning();
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to delete aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}
