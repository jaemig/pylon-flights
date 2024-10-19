import 'dotenv/config';
import { app } from '@getcronit/pylon'

import { addHuman, deleteHuman, getHumanById, getHumans, updateHuman } from './lib/humans';
import { addAircraft, deleteAircraft, getAircraftById, getAircrafts, updateAircraft } from './lib/aircrafts';
// import seed from './db/seed';

export const graphql = {
  Query: {
    humans: getHumans,
    human: getHumanById,
    aircrafts: getAircrafts,
    aircraft: getAircraftById,
  },
  Mutation: {
    addHuman,
    updateHuman,
    deleteHuman,
    addAircraft,
    updateAircraft,
    deleteAircraft,
    // seed: seed,
  }
}

export default app
