import 'dotenv/config';
import { app } from '@getcronit/pylon'

import seed from './db/seed';
import { addHuman, deleteHuman, getHumanByUuid, getHumans, updateHuman } from './lib/humans';
import { addAircraft, deleteAircraft, getAircraftById, getAircrafts, updateAircraft } from './lib/aircrafts';
import { addPassenger, deletePassenger, getPassengerById, getPassengers, updatePassenger } from './lib/passengers';
import { addLuggage, getLuggageById, getLuggages, updateLuggage } from './lib/luggages';

export const graphql = {
  Query: {
    // HUMANS
    human: getHumanByUuid,
    humans: getHumans,

    // PASSENGERS
    passenger: getPassengerById,
    passengers: getPassengers,

    // AIRCRAFTS
    aircraft: getAircraftById,
    aircrafts: getAircrafts,

    // LUGGAGES
    luggage: getLuggageById,
    luggages: getLuggages,
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

    // AIRCRAFTS
    addAircraft,
    updateAircraft,
    deleteAircraft,

    // LUGGAGES
    addLuggage,
    updateLuggage,

    // MISC
    seed: seed,
  }
}

export default app
