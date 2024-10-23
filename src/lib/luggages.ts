import { ServiceError } from '@getcronit/pylon';
import { SQL, eq, and } from 'drizzle-orm';

import getDb from '../db';
import { Luggage, luggages } from '../db/schema';
import { getPassengerById } from './passengers';
import {
    generateUUID,
    isValidUUID,
    validateName,
    validatePagination,
} from '../utils';
import { DEFAULT_TAKE } from '../constants';

/**
 * Validate luggage weight
 * @param weight    The luggage weight
 * @param type      The luggage type
 */
function validateWeight(weight: number, type: Luggage['type']) {
    if (type === 'hand' && (weight < 0.1 || weight > 10)) {
        throw new ServiceError('Invalid luggage weight', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                weight,
                description: 'Hand luggage must be between 0.1 and 12 kg',
            },
        });
    }

    if (type === 'checked' && (weight < 0.1 || weight > 32)) {
        throw new ServiceError('Invalid luggage weight', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                weight,
                description: 'Checked luggage must be between 0.1 and 32 kg',
            },
        });
    }
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
    passengerId?: string,
    type?: Luggage['type'],
) {
    validatePagination(take, skip);

    const conditions: SQL[] = [];

    if (passengerId) {
        if (!isValidUUID(passengerId)) {
            throw new ServiceError('Invalid uuid', {
                statusCode: 400,
                code: 'invalid_uuid',
                details: {
                    passengerId,
                },
            });
        }
        conditions.push(eq(luggages.passengerId, passengerId));
    }

    if (type) {
        conditions.push(eq(luggages.type, type));
    }

    try {
        return await getDb().query.luggages.findMany({
            limit: take ?? DEFAULT_TAKE,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                passenger: {
                    columns: {
                        id: false,
                        flightId: false,
                        humanId: false,
                    },
                    with: {
                        human: {
                            columns: {
                                id: false,
                            },
                        },
                        flight: {
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
            where: eq(luggages.id, id),
            with: {
                passenger: {
                    columns: {
                        id: false,
                        flightId: false,
                        humanId: false,
                    },
                    with: {
                        human: {
                            columns: {
                                id: false,
                            },
                        },
                        flight: {
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
 * @param passengerId   The passenger id
 * @param weight        The luggage weight (in kg)
 * @param type          The luggage type
 * @param description   The luggage description
 * @returns             The added luggage
 */
export async function addLuggage(
    passengerId: string,
    weight: number,
    type: Luggage['type'],
    description: string,
) {
    validateWeight(weight, type);

    const descriptionInput = description.trim();
    validateName(descriptionInput, 'description', 5);

    const existsPassenger = !!(await getPassengerById(passengerId));
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
                id: generateUUID(),
                passengerId,
                weight: Number(weight.toFixed(1)),
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
 * @param id           The luggage id
 * @param passengerId   The passenger id
 * @param weight        The luggage weight
 * @param type          The luggage type
 * @param description   The luggage description
 * @returns             The updated luggage
 */
export async function updateLuggage(
    id: string,
    passengerId?: string,
    weight?: number,
    type?: 'hand' | 'checked',
    description?: string,
) {
    const luggage = await getLuggageById(id);
    if (!luggage) {
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
        validateWeight(weight, type ?? luggage.type);
        values.weight = Number(weight.toFixed(1));
    }

    if (type) {
        validateWeight(weight ?? luggage.weight, type);
        values.type = type;
    }

    if (description !== undefined) {
        const descriptionInput = description.trim();
        validateName(descriptionInput, 'description', 5);
        values.description = descriptionInput;
    }

    if (passengerId) {
        const existsPassenger = !!(await getPassengerById(passengerId));
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
 * @param id        The luggage id
 * @returns         The deleted luggage
 */
export async function deleteLuggage(id: string) {
    const existsLuggage = !!(await getLuggageById(id));
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
