import { and, eq, like, SQL } from "drizzle-orm";
import { ServiceError } from "@getcronit/pylon";

import getDb from "../db";
import { Passenger, passengers } from "../db/schema";
import { $getHumanById } from "./humans";
import { checkEditSecret, generateUUID, isValidUUID } from "../utilts";

/**
 * Get passenger by id (internal)
 * @param id    The id of the passenger
 * @returns     The passenger or undefined if not found
 */
async function $getPassengerById(id: number) {
    return await getDb().query.passengers
        .findFirst({
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
async function $getPassengerBySeat(flightId: number, seat: string) {
    return await getDb().query.passengers
        .findFirst({
            where: and(
                eq(passengers.flightId, flightId),
                eq(passengers.seat, seat)
            )
        })
        .catch(() => undefined);
}

/**
 * Get passenger by flight id (internal)
 * @param flightId  The id of the flight
 * @param humanId   The id of the human
 * @returns         The passenger or undefined if not found
 */
async function $getPassengerByFlightId(flightId: number, humanId: number) {
    return await getDb().query.passengers
        .findFirst({
            where: and(
                eq(passengers.flightId, flightId),
                eq(passengers.humanId, humanId)
            )
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
export async function getPassengers(seat?: string, seatClass?: Passenger['class'], flightId?: number, take?: number, skip?: number) {
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

    if (seat) conditions.push(like(passengers.seat, `${seat.trim().toLocaleLowerCase()}%`));
    if (seatClass) conditions.push(eq(passengers.class, seatClass));
    if (flightId) conditions.push(eq(passengers.flightId, flightId));

    try {
        return await getDb().query.passengers.findMany({
            limit: take ?? 20,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                human: true,
                luggages: true,
            },
            columns: {
                id: false,
            }
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
            where: eq(passengers.uuid, id),
            with: {
                human: true,
                luggages: true,
            },
            columns: {
                id: false,
            }
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
 * @param secret    The secret to authorize the operation
 * @param humanId   The id of the human
 * @param seat      The seat number
 * @param seatClass The class of the seat
 * @param flightId  The id of the flight
 * @returns         The passenger
 */
export async function addPassenger(secret: string, humanId: number, seat: string, seatClass: Passenger['class'], flightId: number) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError("Unauthorized", {
            statusCode: 401,
            code: "unauthorized"
        });
    }

    const isSeatOccupied = !!(await $getPassengerBySeat(flightId, seat));
    if (isSeatOccupied) {
        throw new ServiceError('Seat is already taken', {
            statusCode: 400,
            code: 'seat_taken',
            details: {
                flightId,
                seat
            }
        });
    }

    const isPassengerOnFlight = !!(await $getPassengerByFlightId(flightId, humanId));
    if (isPassengerOnFlight) {
        throw new ServiceError('Human is already on the flight', {
            statusCode: 400,
            code: 'human_on_flight',
            details: {
                flightId,
                humanId,
            }
        });
    }

    const human = await $getHumanById(humanId);
    if (!human) {
        throw new ServiceError('Human not found', {
            statusCode: 404,
            code: 'human_not_found',
            details: {
                humanId
            }
        });
    }

    return await getDb()
        .insert(passengers)
        .values({
            uuid: generateUUID(),
            humanId,
            seat,
            class: seatClass,
            flightId,
        })
        .returning();
}

/**
 * Update passenger
 * @param secret    The secret to authorize the operation
 * @param id        The id of the passenger
 * @param humanId   The id of the human
 * @param seat      The seat number
 * @param seatClass The class of the seat
 * @param flightId  The id of the flight
 * @returns         The updated passenger
 */
export async function updatePassenger(secret: string, id: number, humanId?: number, seat?: string, seatClass?: Passenger['class'], flightId?: number) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existingPassenger = await $getPassengerById(id);
    if (!existingPassenger) {
        throw new ServiceError('Passenger does not exist', {
            statusCode: 400,
            code: 'passenger_does_not_exist',
            details: {
                id
            }
        });
    }

    if (seat) {
        const isSeatOccupied = !!(await $getPassengerBySeat(flightId ?? existingPassenger.flightId, seat));
        if (isSeatOccupied) {
            throw new ServiceError('Seat is already taken', {
                statusCode: 400,
                code: 'seat_taken',
                details: {
                    flightId,
                    seat
                }
            });
        }
    }

    if (flightId) {
        const isPassengerOnFlight = !!(await $getPassengerByFlightId(flightId, humanId ?? existingPassenger.humanId));
        if (isPassengerOnFlight) {
            throw new ServiceError('Human is already on the flight', {
                statusCode: 400,
                code: 'human_on_flight',
                details: {
                    flightId,
                    humanId,
                }
            });
        }
    }

    if (humanId) {
        const human = await $getHumanById(humanId);
        if (!human) {
            throw new ServiceError('Human not found', {
                statusCode: 404,
                code: 'human_not_found',
                details: {
                    humanId
                }
            });
        }
    }

    try {
        const [passenger] = await getDb()
            .update(passengers)
            .set({
                humanId,
                seat,
                class: seatClass,
                flightId,
            })
            .where(eq(passengers.id, id))
            .returning();

        return passenger;
    } catch {
        throw new ServiceError('Failed to update passenger', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete passenger
 * @param secret    The secret
 * @param id        The id of the passenger    
 * @returns         The deleted passenger
 */
export async function deletePassenger(secret: string, id: number) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existingPassenger = await $getPassengerById(id);
    if (!existingPassenger) {
        throw new ServiceError('Passenger does not exist', {
            statusCode: 400,
            code: 'passenger_does_not_exist',
            details: {
                id
            }
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