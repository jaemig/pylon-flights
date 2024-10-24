import { and, eq, gte, lte, not, or, SQL } from 'drizzle-orm';

import getDb from '../db';
import { Flight, flights } from '../db/schema';
import { ServiceError } from '@getcronit/pylon';
import { generateUUID, isValidUUID, validatePagination } from '../utils';
import { getAirportById } from './airport';
import { getHumanById } from './humans';
import { getAirlineById } from './airlines';
import { getAircraftById } from './aircrafts';

const MINIMUM_FLIGHT_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAXIMUM_FLIGHT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get flight by id (internal)
 * Other than the public getFlightById function, the model returns id fields too
 * @param id    The id of the flight
 * @returns     The flight, or undefined if not found
 */
function $getFlightById(id: string) {
    return getDb().query.flights.findFirst({
        where: eq(flights.id, id),
    });
}

/**
 * Validate flight number
 * @param flightNumber  The flight number
 * @throws              ServiceError if the flight number is invalid
 */
function validateFlightNumber(flightNumber: string) {
    if (flightNumber.length < 4 || flightNumber.length > 6) {
        throw new ServiceError('Invalid flight number', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                flightNumber,
                description: 'Flight number must be between 4 and 6 characters',
            },
        });
    }

    const chars = flightNumber.split('');
    if (!isNaN(parseInt(chars[0])) || !isNaN(parseInt(chars[1]))) {
        throw new ServiceError('Invalid flight number', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                flightNumber,
                description: 'Flight number must start with two letters',
            },
        });
    }
}

/**
 * Check if an aircraft is available for a new flight without time conflicts.
 * @param aircraftId The ID of the aircraft
 * @param departureTime The departure time of the flight
 * @param arrivalTime The arrival time of the flight
 * @param flightId The ID of the flight to exclude from the check
 * @returns True if available, false otherwise
 */
async function isAircraftAvailable(
    aircraftId: string,
    departureTime: Date,
    arrivalTime: Date,
    flightId?: string,
): Promise<boolean> {
    const conflictingFlight = await getDb().query.flights.findFirst({
        where: and(
            eq(flights.aircraftId, aircraftId),
            or(
                and(
                    lte(flights.departureTime, departureTime.toISOString()),
                    gte(flights.arrivalTime, departureTime.toISOString()),
                ),
                and(
                    lte(flights.departureTime, arrivalTime.toISOString()),
                    gte(flights.arrivalTime, arrivalTime.toISOString()),
                ),
                and(
                    gte(flights.departureTime, departureTime.toISOString()),
                    lte(flights.arrivalTime, arrivalTime.toISOString()),
                ),
            ),
            flightId ? not(eq(flights.id, flightId)) : undefined,
        ),
    });

    return !conflictingFlight;
}

/**
 * Checks if the human is available for a new flight without time conflicts.
 * @param humanId The ID of the human
 * @param departureTime The departure time of the flight
 * @param arrivalTime The arrival time of the flight
 * @param flightId The ID of the flight to exclude from the check
 * @returns True if available, false otherwise
 */
export async function isHumanAvailable(
    humanId: string,
    departureTime,
    arrivalTime: Date,
    flightId?: string,
): Promise<boolean> {
    const conflictingFlight = await getDb().query.flights.findFirst({
        where: and(
            or(eq(flights.pilotId, humanId), eq(flights.copilotId, humanId)),
            or(
                and(
                    lte(flights.departureTime, departureTime.toISOString()),
                    gte(flights.arrivalTime, departureTime.toISOString()),
                ),
                and(
                    lte(flights.departureTime, arrivalTime.toISOString()),
                    gte(flights.arrivalTime, arrivalTime.toISOString()),
                ),
                and(
                    gte(flights.departureTime, departureTime.toISOString()),
                    lte(flights.arrivalTime, arrivalTime.toISOString()),
                ),
            ),
            flightId ? not(eq(flights.id, flightId)) : undefined,
        ),
    });

    return !conflictingFlight;
}

/**
 * Get flights
 * @param flightNumber          The flight number
 * @param departureAirportId    The id of the departure airport
 * @param arrivalAirportId      The id of the arrival airport
 * @param pilotId                 The id of the pilot
 * @param copilotId               The id of the copilot
 * @param airlineId             The id of the airline
 * @param status                The status of the flight
 * @param aircraftId            The id of the aircraft
 * @param take                  The number of flights to take
 * @param skip                  The number of flights to skip
 * @returns                     Array of flights
 */
export async function getFlights(
    flightNumber?: string,
    departureAirportId?: string,
    arrivalAirportId?: string,
    pilotId?: string,
    copilotId?: string,
    airlineId?: string,
    status?: Flight['status'],
    aircraftId?: string,
    take?: number,
    skip?: number,
) {
    validatePagination(take, skip);

    const conditions: SQL[] = [];

    if (flightNumber) {
        conditions.push(eq(flights.flightNumber, flightNumber.trim()));
    }
    if (status) {
        conditions.push(eq(flights.status, status));
    }
    if (departureAirportId) {
        conditions.push(eq(flights.departureAirportId, departureAirportId));
    }
    if (arrivalAirportId) {
        conditions.push(eq(flights.arrivalAirportId, arrivalAirportId));
    }
    if (pilotId) {
        conditions.push(eq(flights.pilotId, pilotId));
    }
    if (copilotId) {
        conditions.push(eq(flights.copilotId, copilotId));
    }
    if (airlineId) {
        conditions.push(eq(flights.airlineId, airlineId));
    }
    if (aircraftId) {
        conditions.push(eq(flights.aircraftId, aircraftId));
    }

    try {
        return await getDb().query.flights.findMany({
            limit: take ?? 100,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined,
            columns: {
                id: false,
                aircraftId: false,
                airlineId: false,
                arrivalAirportId: false,
                departureAirportId: false,
                pilotId: false,
                copilotId: false,
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
                passengers: {
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
                    },
                },
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get flights', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get a flight by id
 * @param id    The id of the flight
 * @returns     The flight
 */
export async function getFlightById(id: string) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid flight id', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                id,
                description: 'Flight id must be a valid UUID',
            },
        });
    }

    try {
        return await getDb().query.flights.findFirst({
            where: eq(flights.id, id),
            columns: {
                aircraftId: false,
                airlineId: false,
                arrivalAirportId: false,
                departureAirportId: false,
                pilotId: false,
                copilotId: false,
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
                passengers: {
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
                    },
                },
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get flight', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add a flight
 * @param flightNumber          The flight number
 * @param departureAirportId    The id of the departure airport
 * @param arrivalAirportId      The id of the arrival airport
 * @param departureTime         The departure time
 * @param arrivalTime           The arrival time
 * @param pilotId               The id of the pilot
 * @param copilotId             The id of the copilot
 * @param airlineId             The id of the airline
 * @param status                The status of the flight
 * @param aircraftId            The id of the aircraft
 * @returns
 */
export async function addFlight(
    flightNumber: string,
    departureAirportId: string,
    arrivalAirportId: string,
    departureTime: string,
    arrivalTime: string,
    pilotId: string,
    copilotId: string,
    airlineId: string,
    status: Flight['status'],
    aircraftId: string,
) {
    const flightNumberInput = flightNumber.trim().toLocaleUpperCase();
    validateFlightNumber(flightNumberInput);

    const existsDepartureAirport = !!(await getAirportById(departureAirportId));
    if (!existsDepartureAirport) {
        throw new ServiceError('Departure airport not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                departureAirportId,
                description: 'Departure airport not found',
            },
        });
    }

    const existsArrivalAirport = !!(await getAirportById(arrivalAirportId));
    if (!existsArrivalAirport) {
        throw new ServiceError('Arrival airport not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                arrivalAirportId,
                description: 'Arrival airport not found',
            },
        });
    }

    if (departureAirportId === arrivalAirportId) {
        throw new ServiceError('Invalid airports', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureAirportId,
                arrivalAirportId,
                description: 'Departure and arrival airports must be different',
            },
        });
    }

    const existsPilot = !!(await getHumanById(pilotId));
    if (!existsPilot) {
        throw new ServiceError('Pilot not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                pilotId,
                description: 'Pilot not found',
            },
        });
    }

    const existsCopilot = !!(await getHumanById(copilotId));
    if (!existsCopilot) {
        throw new ServiceError('Copilot not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                copilotId,
                description: 'Copilot not found',
            },
        });
    }

    const existsAirline = !!(await getAirlineById(airlineId));
    if (!existsAirline) {
        throw new ServiceError('Airline not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                airlineId,
                description: 'Airline not found',
            },
        });
    }

    const existsAircraft = !!(await getAircraftById(aircraftId));
    if (!existsAircraft) {
        throw new ServiceError('Aircraft not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                aircraftId,
                description: 'Aircraft not found',
            },
        });
    }

    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
        throw new ServiceError('Invalid times', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureTime,
                arrivalTime,
                description:
                    'Departure time and arrival time must be valid dates',
            },
        });
    }

    if (departureDate >= arrivalDate) {
        throw new ServiceError('Invalid times', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureTime,
                arrivalTime,
                description: 'Departure time must be before arrival time',
            },
        });
    }

    if (
        arrivalDate.getTime() - departureDate.getTime() <
            MINIMUM_FLIGHT_DURATION_MS ||
        arrivalDate.getTime() - departureDate.getTime() >
            MAXIMUM_FLIGHT_DURATION_MS
    ) {
        throw new ServiceError('Invalid flight duration', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureTime,
                arrivalTime,
                description:
                    'Flight duration must be between 30 minutes and 24 hours',
            },
        });
    }

    const isPilotAvailable = await isHumanAvailable(
        pilotId,
        departureDate,
        arrivalDate,
    );
    if (!isPilotAvailable) {
        throw new ServiceError('Pilot not available', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                pilotId,
                departureTime,
                arrivalTime,
                description: 'Pilot is not available during this time',
            },
        });
    }

    const isCopilotAvailable = await isHumanAvailable(
        copilotId,
        departureDate,
        arrivalDate,
    );
    if (!isCopilotAvailable) {
        throw new ServiceError('Copilot not available', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                copilotId,
                departureTime,
                arrivalTime,
                description: 'Copilot is not available during this time',
            },
        });
    }

    const aircraftAvailable = await isAircraftAvailable(
        aircraftId,
        departureDate,
        arrivalDate,
    );
    if (!aircraftAvailable) {
        throw new ServiceError('Aircraft not available', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                aircraftId,
                departureTime,
                arrivalTime,
                description: 'Aircraft is not available during this time',
            },
        });
    }

    // Check for conflicting flights with the same flight number
    const conflictingFlights = await getDb().query.flights.findMany({
        where: and(
            eq(flights.flightNumber, flightNumberInput),
            or(
                and(
                    lte(flights.departureTime, departureDate.toISOString()),
                    gte(flights.arrivalTime, departureDate.toISOString()),
                ),
                and(
                    lte(flights.departureTime, arrivalDate.toISOString()),
                    gte(flights.arrivalTime, arrivalDate.toISOString()),
                ),
                and(
                    gte(flights.departureTime, departureDate.toISOString()),
                    lte(flights.arrivalTime, arrivalDate.toISOString()),
                ),
            ),
        ),
    });

    if (conflictingFlights.length > 0) {
        throw new ServiceError('Conflicting flight', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                flightNumber: flightNumberInput,
                departureTime,
                arrivalTime,
                description:
                    'A flight with this number already exists during the specified time range',
            },
        });
    }

    try {
        return await getDb()
            .insert(flights)
            .values({
                id: generateUUID(),
                flightNumber: flightNumberInput,
                departureAirportId,
                arrivalAirportId,
                departureTime: departureDate.toISOString(),
                arrivalTime: arrivalDate.toISOString(),
                pilotId,
                copilotId,
                airlineId,
                status,
                aircraftId,
            })
            .returning();
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to add flight', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

export async function updateFlight(
    id: string,
    flightNumber?: string,
    departureAirportId?: string,
    arrivalAirportId?: string,
    departureTime?: string,
    arrivalTime?: string,
    pilotId?: string,
    copilotId?: string,
    airlineId?: string,
    status?: Flight['status'],
    aircraftId?: string,
) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid flight id', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                id,
                description: 'Flight id must be a valid UUID',
            },
        });
    }

    const existingFlight = await $getFlightById(id);
    if (!existingFlight) {
        throw new ServiceError('Flight not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                id,
                description: 'Flight not found',
            },
        });
    }

    const values: Partial<Flight> = {};

    if (flightNumber) {
        const flightNumberInput = flightNumber.trim().toLocaleUpperCase();
        validateFlightNumber(flightNumberInput);

        values.flightNumber = flightNumberInput;
    }

    if (departureAirportId) {
        const existsDepartureAirport =
            !!(await getAirportById(departureAirportId));
        if (!existsDepartureAirport) {
            throw new ServiceError('Departure airport not found', {
                statusCode: 404,
                code: 'not_found',
                details: {
                    departureAirportId,
                    description: 'Departure airport not found',
                },
            });
        }

        values.departureAirportId = departureAirportId;
    }

    if (arrivalAirportId) {
        const existsArrivalAirport = !!(await getAirportById(arrivalAirportId));
        if (!existsArrivalAirport) {
            throw new ServiceError('Arrival airport not found', {
                statusCode: 404,
                code: 'not_found',
                details: {
                    arrivalAirportId,
                    description: 'Arrival airport not found',
                },
            });
        }

        values.arrivalAirportId = arrivalAirportId;
    }

    if (
        (values.departureAirportId ?? existingFlight.departureAirportId) ===
        (values.arrivalAirportId ?? existingFlight.arrivalAirportId)
    ) {
        throw new ServiceError('Invalid airports', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureAirportId:
                    departureAirportId ?? existingFlight.departureAirportId,
                arrivalAirportId:
                    arrivalAirportId ?? existingFlight.arrivalAirportId,
                description: 'Departure and arrival airports must be different',
            },
        });
    }

    if (pilotId) {
        const existsPilot = !!(await getHumanById(pilotId));
        if (!existsPilot) {
            throw new ServiceError('Pilot not found', {
                statusCode: 404,
                code: 'not_found',
                details: {
                    pilotId,
                    description: 'Pilot not found',
                },
            });
        }

        values.pilotId = pilotId;
    }

    if (copilotId) {
        const existsCopilot = !!(await getHumanById(copilotId));
        if (!existsCopilot) {
            throw new ServiceError('Copilot not found', {
                statusCode: 404,
                code: 'not_found',
                details: {
                    copilotId,
                    description: 'Copilot not found',
                },
            });
        }

        values.copilotId = copilotId;
    }

    if (airlineId) {
        const existsAirline = !!(await getAirlineById(airlineId));
        if (!existsAirline) {
            throw new ServiceError('Airline not found', {
                statusCode: 404,
                code: 'not_found',
                details: {
                    airlineId,
                    description: 'Airline not found',
                },
            });
        }

        values.airlineId = airlineId;
    }

    if (aircraftId) {
        const existsAircraft = !!(await getAircraftById(aircraftId));
        if (!existsAircraft) {
            throw new ServiceError('Aircraft not found', {
                statusCode: 404,
                code: 'not_found',
                details: {
                    aircraftId,
                    description: 'Aircraft not found',
                },
            });
        }

        values.aircraftId = aircraftId;
    }

    const departureDate = new Date(
        departureTime ?? existingFlight.departureTime,
    );
    const arrivalDate = new Date(arrivalTime ?? existingFlight.arrivalTime);

    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
        throw new ServiceError('Invalid times', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureTime,
                arrivalTime,
                description:
                    'Departure time and arrival time must be valid dates',
            },
        });
    }

    if (departureDate >= arrivalDate) {
        throw new ServiceError('Invalid times', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureTime,
                arrivalTime,
                description: 'Departure time must be before arrival time',
            },
        });
    }

    if (
        (arrivalTime || departureTime) &&
        (arrivalDate.getTime() - departureDate.getTime() <
            MINIMUM_FLIGHT_DURATION_MS ||
            arrivalDate.getTime() - departureDate.getTime() >
                MAXIMUM_FLIGHT_DURATION_MS)
    ) {
        throw new ServiceError('Invalid flight duration', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                departureTime: departureTime ?? existingFlight.departureTime,
                arrivalTime: arrivalTime ?? existingFlight.arrivalTime,
                description:
                    'Flight duration must be between 30 minutes and 24 hours',
            },
        });
    }

    if (departureTime) {
        values.departureTime = departureDate.toISOString();
    }
    if (arrivalTime) {
        values.arrivalTime = arrivalDate.toISOString();
    }

    const isPilotAvailable = await isHumanAvailable(
        pilotId ?? existingFlight.pilotId,
        departureDate,
        arrivalDate,
        existingFlight.id,
    );

    if (!isPilotAvailable) {
        throw new ServiceError('Pilot not available', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                pilotId,
                departureTime,
                arrivalTime,
                description: 'Pilot is not available during this time',
            },
        });
    }

    const isCopilotAvailable = await isHumanAvailable(
        copilotId ?? existingFlight.copilotId,
        departureDate,
        arrivalDate,
        existingFlight.id,
    );

    if (!isCopilotAvailable) {
        throw new ServiceError('Copilot not available', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                copilotId,
                departureTime,
                arrivalTime,
                description: 'Copilot is not available during this time',
            },
        });
    }

    const aircraftAvailable = await isAircraftAvailable(
        aircraftId ?? existingFlight.aircraftId,
        departureDate,
        arrivalDate,
        existingFlight.id,
    );

    if (!aircraftAvailable) {
        throw new ServiceError('Aircraft not available', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                aircraftId,
                departureTime,
                arrivalTime,
                description: 'Aircraft is not available during this time',
            },
        });
    }

    // Check for conflicting flights with the same flight number
    const conflictingFlights = await getDb().query.flights.findMany({
        where: and(
            eq(
                flights.flightNumber,
                values.flightNumber ?? existingFlight.flightNumber,
            ),
            or(
                and(
                    lte(flights.departureTime, departureDate.toISOString()),
                    gte(flights.arrivalTime, departureDate.toISOString()),
                ),
                and(
                    lte(flights.departureTime, arrivalDate.toISOString()),
                    gte(flights.arrivalTime, arrivalDate.toISOString()),
                ),
                and(
                    gte(flights.departureTime, departureDate.toISOString()),
                    lte(flights.arrivalTime, arrivalDate.toISOString()),
                ),
            ),
            not(eq(flights.id, id)),
        ),
    });

    if (conflictingFlights.length > 0) {
        throw new ServiceError('Conflicting flight', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                flightNumber:
                    values.flightNumber ?? existingFlight.flightNumber,
                departureTime,
                arrivalTime,
                description:
                    'A flight with this number already exists during the specified time range',
            },
        });
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No values to update', {
            statusCode: 400,
            code: 'no_update_data',
        });
    }

    try {
        return await getDb()
            .update(flights)
            .set(values)
            .where(eq(flights.id, id))
            .returning();
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to update flight', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete a flight
 * @param id    The id of the flight
 * @returns     The deleted flight
 */
export async function deleteFlight(id: string) {
    const existingFlight = await getFlightById(id);
    if (!existingFlight) {
        throw new ServiceError('Flight not found', {
            statusCode: 404,
            code: 'not_found',
            details: {
                id,
                description: 'Flight not found',
            },
        });
    }

    try {
        const [flight] = await getDb()
            .delete(flights)
            .where(eq(flights.id, id))
            .returning();

        return flight;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to delete flight', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}
