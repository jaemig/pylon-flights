import { ServiceError } from '@getcronit/pylon';
import { eq, like } from 'drizzle-orm';

import getDb from '../db';
import { aircrafts } from '../db/schema';
import { checkEditSecret, generateUUID, isValidUUID } from '../utilts';

/**
 * Get aircraft by id
 * @param id    The id of the aircraft
 * @returns     The aircraft, or undefined if not found
 */
async function $getAircraftById(id: number) {
    return await getDb()
        .query.aircrafts.findFirst({
            where: eq(aircrafts.id, id),
        })
        .catch(() => undefined);
}

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

    const filterModel = model?.trim().toLocaleLowerCase();
    try {
        return await getDb().query.aircrafts.findMany({
            limit: take ?? 20,
            offset: skip,
            where:
                filterModel || false
                    ? like(aircrafts.model, `${filterModel}%`)
                    : undefined,
            columns: {
                id: false,
            },
        });
    } catch {
        throw new ServiceError('Failed to get aircrafts', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get aircraft by uuid
 * @param id    The uuid of the aircraft
 * @returns     The aircraft or undefined if not found
 */
export async function getAircraftById(id: string) {
    if (isValidUUID(id)) {
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
            where: eq(aircrafts.uuid, id),
        });
    } catch {
        throw new ServiceError('Failed to get aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add a new aircraft
 * @param secret    The secret to authorize the operation
 * @param icao      The ICAO code of the aircraft
 * @param model     The model name of the aircraft
 * @returns         The added aircraft
 */
export async function addAircraft(secret: string, icao: string, model: string) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

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

    const modelInput = model.trim();
    if (modelInput.length === 0) {
        throw new ServiceError('Invalid aircraft model', {
            statusCode: 400,
            code: 'invalid_aircraft_model',
            details: {
                model,
                description: 'The aircraft model must not be empty',
            },
        });
    }

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
                uuid: generateUUID(),
                icao,
                model: modelInput,
            })
            .returning();

        return aircraft;
    } catch {
        throw new ServiceError('Failed to add aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Update aircraft by id
 * @param secret    The secret to authorize the operation
 * @param id        The id of the aircraft
 * @param icao      The ICAO code of the aircraft
 * @param model     The model name of the aircraft
 * @returns         The updated aircraft
 */
export async function updateAircraft(
    secret: string,
    id: number,
    icao?: string,
    model?: string,
) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const icaoInput = icao?.trim().toLocaleUpperCase();
    if (icaoInput) {
        if (icaoInput.length !== 4) {
            throw new ServiceError('Invalid aircraft id', {
                statusCode: 400,
                code: 'invalid_aircraft_id',
                details: {
                    icao,
                    expectedLength: 4,
                    description:
                        'The aircraft id must follow the ICAO code format',
                },
            });
        }
        const existingAircraft = await $getAircraftByICAO(icaoInput);
        if (existingAircraft) {
            throw new ServiceError('Aircraft already exists', {
                statusCode: 400,
                code: 'aircraft_exists',
                details: {
                    icao: icaoInput,
                    description:
                        'An aircraft with the same ICAO code already exists',
                },
            });
        }
    }

    const aircraft = await $getAircraftById(id);
    if (!aircraft) {
        throw new ServiceError('Aircraft not found', {
            statusCode: 404,
            code: 'aircraft_not_found',
            details: {
                id,
            },
        });
    }

    const modelInput = model?.trim();
    if (modelInput && modelInput.length === 0) {
        throw new ServiceError('Invalid aircraft model', {
            statusCode: 400,
            code: 'invalid_aircraft_model',
            details: {
                model,
                description: 'The aircraft model must not be empty',
            },
        });
    }

    try {
        const [updatedAircraft] = await getDb()
            .update(aircrafts)
            .set({
                icao: icaoInput,
                model: modelInput,
            })
            .where(eq(aircrafts.id, id))
            .returning();

        return updatedAircraft;
    } catch {
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
export async function deleteAircraft(secret: string, id: number) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const aircraft = await $getAircraftById(id);
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
    } catch {
        throw new ServiceError('Failed to delete aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}
