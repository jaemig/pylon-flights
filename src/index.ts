import 'dotenv/config';

import { app } from '@getcronit/pylon'

import getDb from './db';
// import seed from './db/seed';

export const graphql = {
  Query: {
    humans: async () => {
      return await getDb().query.humans.findMany()
    },
    aircrafts: async () => {
      return await getDb().query.aircrafts.findMany()
    },
    airports: async () => {
      return await getDb().query.airports.findMany()
    },
    flights: async () => {
      return await getDb().query.flights.findMany()
    },
    airlines: async () => {
      return await getDb().query.airlines.findMany()
    },
    passengers: async () => {
      return await getDb().query.passengers.findMany()
    }
  },
  Mutation: {
    // seed: seed,
  }
}

export default app
