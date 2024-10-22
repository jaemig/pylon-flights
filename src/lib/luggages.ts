import { ServiceError } from '@getcronit/pylon';
import { SQL, eq, and } from 'drizzle-orm';

import getDb from '../db';
import { Luggage, luggages } from '../db/schema';
import { $getPassengerById } from './passengers';
import {
    checkEditSecret,
    countDecimals,
    generateUUID,
    isValidUUID,
} from '../utils';

async function $getLuggageById(id: number) {
    return await getDb().query.luggages.findFirst({
        where: eq(luggages.id, id),
    });
}

/**
 * Get luggages
 * @param take          The number of records to take
 * @param skip          The number of records to skip
 * @param passengerId   The passenger id
 * @param type          The luggage type
 * @returns             The list of luggages
 */
export async function getLuggages(
    take?: number,
    skip?: number,
    passengerId?: number,
    type?: Luggage['type'],
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
                    },
                },
            },
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
 * Get luggage by uuid
 * @param id    The uuid of the luggage
 * @returns     The luggage
 */
export async function getLuggageById(id: string) {
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
        return await getDb().query.luggages.findFirst({
            where: eq(luggages.uuid, id),
            with: {
                passenger: {
                    with: {
                        human: true,
                    },
                },
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get luggage', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add luggage
 * @param secret        The secret to authorize the operation
 * @param passengerId   The passenger id
 * @param weight        The luggage weight (in kg)
 * @param type          The luggage type
 * @param description   The luggage description
 * @returns             The added luggage
 */
export async function addLuggage(
    secret: string,
    passengerId: number,
    weight: number,
    type: Luggage['type'],
    description: string,
) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }
    if (weight < 0.1 || weight > 32 || countDecimals(weight) > 2) {
        throw new ServiceError('Invalid luggage weight', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                weight,
                description:
                    'Weight must be between 0.1 and 32 kg and have at most 2 decimals',
            },
        });
    }

    const descriptionInput = description.trim();
    if (descriptionInput.length < 5 || descriptionInput.length > 100) {
        throw new ServiceError('Invalid luggage description', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                input: description,
                description: 'Description must be between 5 and 100 characters',
            },
        });
    }

    const existsPassenger = !!(await $getPassengerById(passengerId));
    if (!existsPassenger) {
        throw new ServiceError('Passenger not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                passengerId,
            },
        });
    }

    try {
        return await getDb()
            .insert(luggages)
            .values({
                uuid: generateUUID(),
                passengerId,
                weight,
                type,
                description: descriptionInput,
            })
            .returning();
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to add luggage', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Update luggage
 * @param secret       The secret to authorize the operation
 * @param id           The luggage id
 * @param passengerId   The passenger id
 * @param weight        The luggage weight
 * @param type          The luggage type
 * @param description   The luggage description
 * @returns             The updated luggage
 */
export async function updateLuggage(
    secret: string,
    id: number,
    passengerId?: number,
    weight?: number,
    type?: 'hand' | 'checked',
    description?: string,
) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existsLuggage = !!(await $getLuggageById(id));
    if (!existsLuggage) {
        throw new ServiceError('Luggage not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                id,
            },
        });
    }

    const values: Partial<Luggage> = {};

    if (weight) {
        if (weight < 0.1 || weight > 32 || countDecimals(weight) > 2) {
            throw new ServiceError('Invalid luggage weight', {
                statusCode: 400,
                code: 'invalid_data',
                details: {
                    weight,
                    description:
                        'Weight must be between 0.1 and 32 kg and have at most 2 decimals',
                },
            });
        }
        values.weight = weight;
    }

    if (type) {
        values.type = type;
    }

    if (description !== undefined) {
        const descriptionInput = description.trim();
        if (descriptionInput.length < 5 || descriptionInput.length > 100) {
            throw new ServiceError('Invalid luggage description', {
                statusCode: 400,
                code: 'invalid_data',
                details: {
                    description,
                },
            });
        }
        values.description = descriptionInput;
    }

    if (passengerId) {
        const existsPassenger = !!(await $getPassengerById(passengerId));
        if (!existsPassenger) {
            throw new ServiceError('Passenger not found', {
                statusCode: 404,
                code: 'not_found',
                details: {
                    passengerId,
                },
            });
        }
        values.passengerId = passengerId;
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No update values provided', {
            statusCode: 400,
            code: 'invalid_data',
        });
    }

    try {
        const [luggage] = await getDb()
            .update(luggages)
            .set(values)
            .where(eq(luggages.id, id))
            .returning();

        return luggage;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to update luggage', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete luggage
 * @param secret    The secret to authorize the operation
 * @param id        The luggage id
 * @returns         The deleted luggage
 */
export async function deleteLuggage(secret: string, id: number) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existsLuggage = !!(await $getLuggageById(id));
    if (!existsLuggage) {
        throw new ServiceError('Luggage not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                id,
            },
        });
    }

    try {
        return await getDb()
            .delete(luggages)
            .where(eq(luggages.id, id))
            .returning();
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to delete luggage', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}
