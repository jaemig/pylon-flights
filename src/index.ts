import 'dotenv/config';

import { app } from '@getcronit/pylon'

import getDb from './db';

export const graphql = {
  Query: {
    hello: async () => {
      return await getDb().query.humans.findMany()
    }
  },
  Mutation: {}
}

export default app
