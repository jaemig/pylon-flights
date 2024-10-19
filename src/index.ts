import 'dotenv/config';

import { app } from '@getcronit/pylon'

import { addHuman, deleteHuman, getHumanById, getHumans, updateHuman } from './lib/humans';
import { addAircraft, deleteAircraft, getAircraftById, getAircrafts } from './lib/aircrafts';
// import seed from './db/seed';

export const graphql = {
  Query: {
    humans: getHumans,
    human: getHumanById,
    aircrafts: getAircrafts,
    aircraft: getAircraftById,
    // aircrafts: async () => {
    //   return await getDb().query.aircrafts.findMany()
    // },
    // airports: async () => {
    //   return await getDb().query.airports.findMany()
    // },
    // flights: async () => {
    //   return await getDb().query.flights.findMany()
    // },
    // airlines: async () => {
    //   return await getDb().query.airlines.findMany()
    // },
    // passengers: async () => {
    //   return await getDb().query.passengers.findMany()
    // }
  },
  Mutation: {
    addHuman,
    updateHuman,
    deleteHuman,
    addAircraft,
    deleteAircraft,
    // seed: seed,
  }
}

export default app
