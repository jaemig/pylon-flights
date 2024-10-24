import 'dotenv/config';
import { app, Bindings, Env } from '@getcronit/pylon';

import seed from './db/seed';
import {
    addHuman,
    deleteHuman,
    getHumanById,
    getHumans,
    updateHuman,
} from './lib/humans';
import {
    addAircraft,
    deleteAircraft,
    getAircraftById,
    getAircrafts,
    updateAircraft,
} from './lib/aircrafts';
import {
    addPassenger,
    deletePassenger,
    getPassengerById,
    getPassengers,
    updatePassenger,
} from './lib/passengers';
import {
    addLuggage,
    deleteLuggage,
    getLuggageById,
    getLuggages,
    updateLuggage,
} from './lib/luggages';
import {
    addAirline,
    deleteAirline,
    getAirlineById,
    getAirlines,
    updateAirline,
} from './lib/airlines';
import {
    addAirport,
    deleteAirport,
    getAirportById,
    getAirports,
    updateAirport,
} from './lib/airport';
import {
    addFlight,
    deleteFlight,
    getFlightById,
    getFlights,
    updateFlight,
} from './lib/flights';
import { cloudflareRateLimiter } from '@hono-rate-limiter/cloudflare';

app.use(
    cloudflareRateLimiter<Env>({
        rateLimitBinding: (c) => (c.env as Bindings).RATE_LIMITER,
        keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? '',
    }),
);

export const graphql = {
    Query: {
        // HUMANS
        human: getHumanById,
        humans: getHumans,

        // PASSENGERS
        passenger: getPassengerById,
        passengers: getPassengers,

        // LUGGAGES
        luggage: getLuggageById,
        luggages: getLuggages,

        // AIRCRAFTS
        aircraft: getAircraftById,
        aircrafts: getAircrafts,

        // AIRLINES
        airlines: getAirlines,
        airline: getAirlineById,

        // AIRPORTS
        airports: getAirports,
        airport: getAirportById,

        // FLIGHTS
        flights: getFlights,
        flight: getFlightById,
    },
    Mutation: {
        // HUMANS
        addHuman,
        updateHuman,
        deleteHuman,

        // PASSENGERS
        addPassenger,
        updatePassenger,
        deletePassenger,

        // LUGGAGES
        addLuggage,
        updateLuggage,
        deleteLuggage,

        // AIRCRAFTS
        addAircraft,
        updateAircraft,
        deleteAircraft,

        // AIRLINES
        addAirline,
        updateAirline,
        deleteAirline,

        // AIRPORTS
        addAirport,
        updateAirport,
        deleteAirport,

        // FLIGHTS
        addFlight: addFlight,
        updateFlight: updateFlight,
        deleteFlight: deleteFlight,

        // MISC
        seed: seed,
    },
};

export default app;
