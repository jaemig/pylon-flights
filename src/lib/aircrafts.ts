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
    return await getDb().query.aircrafts.findMany({
        limit: take ?? 20,
        offset: skip,
        where: filterModel || false ? like(aircrafts.model, `${filterModel}%`) : undefined,
    });
}

/**
 * Get aircraft by id (ICAO code)
 * @param id    The ICAC code of the aircraft
 * @returns     The aircraft or undefined if not found
 */
export async function getAircraftById(id: string) {
    try {
        return await getDb().query.aircrafts
            .findFirst({
                where: eq(aircrafts.id, id)
            });
    } catch {
        return undefined;
    }
}

export async function addAircraft(id: string, model: string) {
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

    const [aircraft] = await getDb()
        .insert(aircrafts)
        .values({
            id,
            model
        })
        .returning();

    return aircraft;
}

export async function deleteAircraft(id: string) {
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

    await getDb().delete(aircrafts).where(eq(aircrafts.id, id));

    return aircraft;
}