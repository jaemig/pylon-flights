import { ServiceError } from "@getcronit/pylon";
import { eq, like } from "drizzle-orm";

import getDb from "../db";
import { aircrafts } from "../db/schema";

/**
 * Get aircrafts
 * @param model  The model name of the aircraft
 * @param take  The number of aircrafts to take
 * @param skip  The number of aircrafts to skip
 * @returns     Array of aircrafts
 */
export async function getAircrafts(model?: string, take?: number, skip?: number) {
    if ((take !== undefined && take < 0) || (skip !== undefined && skip < 0)) {
        throw new ServiceError('Invalid pagination', {
            statusCode: 400,
            code: 'invalid_pagination',
            details: {
                take,
                skip
            }
        });
    }

    const filterModel = model?.trim().toLocaleLowerCase();
    try {
        return await getDb().query.aircrafts.findMany({
            limit: take ?? 20,
            offset: skip,
            where: filterModel || false ? like(aircrafts.model, `${filterModel}%`) : undefined,
        });
    } catch {
        throw new ServiceError('Failed to get aircrafts', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get aircraft by id (ICAO code)
 * @param id    The ICAC code of the aircraft
 * @returns     The aircraft or undefined if not found
 */
export async function getAircraftById(id: string) {
    if (id.length !== 4) {
        throw new ServiceError('Invalid aircraft id', {
            statusCode: 400,
            code: 'invalid_aircraft_id',
            details: {
                id,
                expectedLength: 4,
                description: 'The aircraft id must follow the ICAO code format'
            }
        });
    }

    try {
        return await getDb().query.aircrafts
            .findFirst({
                where: eq(aircrafts.id, id)
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
 * @param id    The ICAC code of the aircraft
 * @param model The model name of the aircraft
 * @returns     The added aircraft
 */
export async function addAircraft(id: string, model: string) {
    if (id.length !== 4) {
        throw new ServiceError('Invalid aircraft id', {
            statusCode: 400,
            code: 'invalid_aircraft_id',
            details: {
                id,
                expectedLength: 4,
                description: 'The aircraft id must follow the ICAO code format'
            }
        });
    }

    const modelInput = model.trim();
    if (modelInput.length === 0) {
        throw new ServiceError('Invalid aircraft model', {
            statusCode: 400,
            code: 'invalid_aircraft_model',
            details: {
                model,
                description: 'The aircraft model must not be empty'
            }
        });
    }

    const existingAircraft = await getAircraftById(id);
    if (existingAircraft) {
        throw new ServiceError('Aircraft already exists', {
            statusCode: 400,
            code: 'aircraft_already_exists',
            details: {
                id
            }
        });
    }

    try {
        const [aircraft] = await getDb()
            .insert(aircrafts)
            .values({
                id,
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
 * @param id    The ICAC code of the aircraft
 * @param model The model name of the aircraft
 * @returns     The updated aircraft
 */
export async function updateAircraft(id: string, model: string) {
    if (id.length !== 4) {
        throw new ServiceError('Invalid aircraft id', {
            statusCode: 400,
            code: 'invalid_aircraft_id',
            details: {
                id,
                expectedLength: 4,
                description: 'The aircraft id must follow the ICAO code format'
            }
        });
    }

    const aircraft = await getAircraftById(id);

    if (!aircraft) {
        throw new ServiceError('Aircraft not found', {
            statusCode: 404,
            code: 'aircraft_not_found',
            details: {
                id
            }
        });
    }

    const modelInput = model.trim();
    if (modelInput && modelInput.length === 0) {
        throw new ServiceError('Invalid aircraft model', {
            statusCode: 400,
            code: 'invalid_aircraft_model',
            details: {
                model,
                description: 'The aircraft model must not be empty'
            }
        });
    }

    try {
        const [updatedAircraft] = await getDb()
            .update(aircrafts)
            .set({
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
 * @param id    The ICAC code of the aircraft
 * @returns     The deleted aircraft
 */
export async function deleteAircraft(id: string) {
    if (id.length !== 4) {
        throw new ServiceError('Invalid aircraft id', {
            statusCode: 400,
            code: 'invalid_aircraft_id',
            details: {
                id,
                expectedLength: 4,
                description: 'The aircraft id must follow the ICAO code format'
            }
        });
    }
    const aircraft = await getAircraftById(id);

    if (!aircraft) {
        throw new ServiceError('Aircraft not found', {
            statusCode: 404,
            code: 'aircraft_not_found',
            details: {
                id
            }
        });
    }

    try {
        await getDb().delete(aircrafts).where(eq(aircrafts.id, id));

        return aircraft;
    } catch {
        throw new ServiceError('Failed to delete aircraft', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}