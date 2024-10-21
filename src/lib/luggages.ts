import { ServiceError } from "@getcronit/pylon";
import { SQL, eq, and } from "drizzle-orm";

import getDb from "../db";
import { Luggage, luggages } from "../db/schema";

/**
 * Get luggages
 * @param take          The number of records to take
 * @param skip          The number of records to skip
 * @param passengerId   The passenger id
 * @param type          The luggage type
 * @returns             The list of luggages
 */
export async function getLuggages(take?: number, skip?: number, passengerId?: number, type?: Luggage['type']) {
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

    const conditions: SQL[] = [];

    if (passengerId) conditions.push(eq(luggages.passengerId, passengerId));
    if (type) conditions.push(eq(luggages.type, type));

    try {
        return await getDb().query.luggages.findMany({
            limit: take ?? 20,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                passenger: {
                    with: {
                        human: true,
                    }
                }
            }
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get luggages', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get luggage by id
 * @param id    The luggage id
 * @returns     The luggage
 */
export async function getLuggageById(id: number) {
    if (id <= 0) {
        throw new ServiceError('Invalid luggage id', {
            statusCode: 400,
            code: 'invalid_id',
            details: {
                id
            }
        });
    }

    try {
        return await getDb().query.luggages.findFirst({
            where: eq(luggages.id, id),
            with: {
                passenger: {
                    with: {
                        human: true,
                    }
                }
            }
        });
    } catch {
        throw new ServiceError('Failed to get luggage', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add luggage
 * @param passengerId   The passenger id
 * @param weight        The luggage weight
 * @param type          The luggage type
 * @param description   The luggage description
 * @returns             The added luggage
 */
export async function addLuggage(passengerId: number, weight: number, type: Luggage['type'], description: string) {
    const descriptionInput = description.trim();
    if (passengerId <= 0 || weight <= 0 || !descriptionInput) {
        throw new ServiceError('Invalid luggage data', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                passengerId,
                weight,
                type,
                description
            }
        });
    }

    try {
        return await getDb().insert(luggages).values({
            passengerId,
            weight,
            type,
            description: descriptionInput,
        });
    } catch {
        throw new ServiceError('Failed to add luggage', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Update luggage
 * @param passengerId   The passenger id
 * @param weight        The luggage weight
 * @param type          The luggage type
 * @param description   The luggage description
 * @returns             The updated luggage
 */
export async function updateLuggage(passengerId: number, weight?: number, type?: "hand" | "checked", description?: string) {
    if (passengerId <= 0) {
        throw new ServiceError('Invalid luggage data', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                passengerId,
                weight,
                type,
                description
            }
        });
    }

    const values: Partial<Luggage> = {};
    if (weight !== undefined) values.weight = weight;
    if (type) values.type = type;
    const descriptionInput = description?.trim();
    if (descriptionInput) {
        if (descriptionInput.length === 0) {
            throw new ServiceError('Invalid luggage data', {
                statusCode: 400,
                code: 'invalid_data',
                details: {
                    passengerId,
                    weight,
                    type,
                    description
                }
            });
        }
        values.description = descriptionInput;
    }

    try {
        return await getDb().update(luggages).set(values).where(eq(luggages.passengerId, passengerId)).returning();
    } catch {
        throw new ServiceError('Failed to update luggage', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}