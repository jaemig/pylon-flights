import 'dotenv/config';
import { app } from '@getcronit/pylon';

import seed from './db/seed';
import {
    addHuman,
    deleteHuman,
    getHumanByUuid,
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

export const graphql = {
    Query: {
        // HUMANS
        human: getHumanByUuid,
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

        // MISC
        seed: seed,
    },
};

export default app;
