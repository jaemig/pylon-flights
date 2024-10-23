import { and, eq, like, SQL } from 'drizzle-orm';
import { ServiceError } from '@getcronit/pylon';

import getDb from '../db';
import { Passenger, passengers } from '../db/schema';
import { getHumanById } from './humans';
import { generateUUID, isValidUUID, validatePagination } from '../utils';
import { DEFAULT_TAKE } from '../constants';

/**
 * Get passenger by human id (internal)
 * Compared to the exposed function, this function provides the foreign key columns
 * @param id    The id of the human
 * @returns     The passenger or undefined if not found
 */
async function $getPassengerById(id: string) {
    return await getDb()
        .query.passengers.findFirst({
            where: eq(passengers.id, id),
        })
        .catch(() => undefined);
}

/**
 * Get passenger by seat (internal)
 * @param flightId  The id of the flight
 * @param seat      The seat number
 * @returns         The passenger or undefined if not found
 */
async function $getPassengerBySeat(flightId: string, seat: string) {
    return await getDb()
        .query.passengers.findFirst({
            where: and(
                eq(passengers.flightId, flightId),
                eq(passengers.seat, seat),
            ),
        })
        .catch(() => undefined);
}

/**
 * Get passenger by flight id (internal)
 * @param flightId  The id of the flight
 * @param humanId   The id of the human
 * @returns         The passenger or undefined if not found
 */
async function $getPassengerByFlightId(flightId: string, humanId: string) {
    return await getDb()
        .query.passengers.findFirst({
            where: and(
                eq(passengers.flightId, flightId),
                eq(passengers.humanId, humanId),
            ),
        })
        .catch(() => undefined);
}

/**
 * Get passengers
 * @param seat      The seat number
 * @param seatClass The class of the seat
 * @param flightId  The id of the flight
 * @param take      The number of passengers to take
 * @param skip      The number of passengers to skip
 * @returns         Array of passengers
 */
export async function getPassengers(
    seat?: string,
    seatClass?: Passenger['class'],
    flightId?: string,
    take?: number,
    skip?: number,
) {
    validatePagination(take, skip);

    const conditions: SQL[] = [];

    if (seat)
        conditions.push(
            like(passengers.seat, `${seat.trim().toLocaleLowerCase()}%`),
        );
    if (seatClass) conditions.push(eq(passengers.class, seatClass));
    if (flightId) conditions.push(eq(passengers.flightId, flightId));

    try {
        return await getDb().query.passengers.findMany({
            limit: take ?? DEFAULT_TAKE,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                human: {
                    columns: {
                        id: false,
                    },
                },
                luggages: {
                    columns: {
                        id: false,
                        passengerId: false,
                    },
                },
            },
            columns: {
                id: false,
                flightId: false,
                humanId: false,
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get passengers', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get passenger by uuid
 * @param id    The uuid of the passenger
 * @returns     The passenger
 */
export async function getPassengerById(id: string) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid uuid', {
            statusCode: 400,
            code: 'invalid_uuid',
        });
    }

    try {
        return await getDb().query.passengers.findFirst({
            where: eq(passengers.id, id),
            columns: {
                flightId: false,
                humanId: false,
            },
            with: {
                human: {
                    columns: {
                        id: false,
                    },
                },
                luggages: {
                    columns: {
                        id: false,
                        passengerId: false,
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
        });
    } catch (e) {
        console.log(e);
        throw new ServiceError('Failed to get passenger', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add passenger (to flight)
 * @param humanId   The id of the human
 * @param seat      The seat number
 * @param seatClass The class of the seat
 * @param flightId  The id of the flight
 * @returns         The passenger
 */
export async function addPassenger(
    humanId: string,
    seat: string,
    seatClass: Passenger['class'],
    flightId: string,
) {
    const isSeatOccupied = !!(await $getPassengerBySeat(flightId, seat));
    if (isSeatOccupied) {
        throw new ServiceError('Seat is already taken', {
            statusCode: 400,
            code: 'seat_taken',
            details: {
                flightId,
                seat,
            },
        });
    }

    const isPassengerOnFlight = !!(await $getPassengerByFlightId(
        flightId,
        humanId,
    ));
    if (isPassengerOnFlight) {
        throw new ServiceError('Human is already on the flight', {
            statusCode: 400,
            code: 'human_on_flight',
            details: {
                flightId,
                humanId,
            },
        });
    }

    const doesHumanExist = !!(await getHumanById(humanId));
    if (!doesHumanExist) {
        throw new ServiceError('Human not found', {
            statusCode: 404,
            code: 'human_not_found',
            details: {
                humanId,
            },
        });
    }

    return await getDb()
        .insert(passengers)
        .values({
            id: generateUUID(),
            humanId,
            seat,
            class: seatClass,
            flightId,
        })
        .returning();
}

/**
 * Update passenger
 * @param id        The id of the passenger
 * @param humanId   The id of the human
 * @param seat      The seat number
 * @param seatClass The class of the seat
 * @param flightId  The id of the flight
 * @returns         The updated passenger
 */
export async function updatePassenger(
    id: string,
    humanId?: string,
    seat?: string,
    seatClass?: Passenger['class'],
    flightId?: string,
) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid uuid', {
            statusCode: 400,
            code: 'invalid_uuid',
            details: {
                id,
                description: 'The id is not a valid uuid',
            },
        });
    }

    const existingPassenger = await $getPassengerById(id);
    if (!existingPassenger) {
        throw new ServiceError('Passenger does not exist', {
            statusCode: 400,
            code: 'passenger_does_not_exist',
            details: {
                id,
            },
        });
    }

    const values: Partial<Passenger> = {};

    if (seat) {
        const occupiedSeat = await $getPassengerBySeat(
            flightId ?? existingPassenger.flightId,
            seat,
        );
        if (occupiedSeat && occupiedSeat.id !== id) {
            throw new ServiceError('Seat is already taken', {
                statusCode: 400,
                code: 'seat_taken',
                details: {
                    flightId,
                    seat,
                },
            });
        }
        values.seat = seat;
    }

    if (flightId) {
        if (!isValidUUID(flightId)) {
            throw new ServiceError('Invalid uuid', {
                statusCode: 400,
                code: 'invalid_uuid',
                details: {
                    flightId,
                    description: 'The flightId is not a valid uuid',
                },
            });
        }
        const passengerOnSameFlight = await $getPassengerByFlightId(
            flightId,
            humanId ?? existingPassenger.humanId,
        );
        if (passengerOnSameFlight) {
            throw new ServiceError('Human is already on the flight', {
                statusCode: 400,
                code: 'human_on_flight',
                details: {
                    flightId,
                    humanId,
                },
            });
        }
        values.flightId = flightId;
    }

    if (humanId) {
        if (!isValidUUID(humanId)) {
            throw new ServiceError('Invalid uuid', {
                statusCode: 400,
                code: 'invalid_uuid',
                details: {
                    humanId,
                    description: 'The humanId is not a valid uuid',
                },
            });
        }
        const human = await getHumanById(humanId);

        if (!human) {
            throw new ServiceError('Human not found', {
                statusCode: 404,
                code: 'human_not_found',
                details: {
                    humanId,
                },
            });
        }

        const humanOnFlight = await getDb().query.passengers.findFirst({
            where: and(
                eq(passengers.flightId, flightId ?? existingPassenger.flightId),
                eq(passengers.humanId, humanId),
            ),
        });

        if (humanOnFlight && humanOnFlight.id !== id) {
            throw new ServiceError('Human is already on the flight', {
                statusCode: 400,
                code: 'human_on_flight',
                details: {
                    flightId: flightId ?? existingPassenger.flightId,
                    humanId,
                },
            });
        }

        values.humanId = humanId;
    }

    if (seatClass) {
        values.class = seatClass;
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No values to update', {
            statusCode: 400,
            code: 'no_update_data',
        });
    }

    try {
        const [passenger] = await getDb()
            .update(passengers)
            .set(values)
            .where(eq(passengers.id, id))
            .returning();

        return passenger;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to update passenger', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete passenger
 * @param id        The id of the passenger
 * @returns         The deleted passenger
 */
export async function deletePassenger(id: string) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid uuid', {
            statusCode: 400,
            code: 'invalid_uuid',
            details: {
                id,
            },
        });
    }

    const existingPassenger = await $getPassengerById(id);
    if (!existingPassenger) {
        throw new ServiceError('Passenger does not exist', {
            statusCode: 400,
            code: 'passenger_does_not_exist',
            details: {
                id,
            },
        });
    }

    try {
        const [passenger] = await getDb()
            .delete(passengers)
            .where(eq(passengers.id, id))
            .returning();

        return passenger;
    } catch {
        throw new ServiceError('Failed to delete passenger', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}
