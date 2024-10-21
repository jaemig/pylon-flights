import 'dotenv/config';
import { getContext } from '@getcronit/pylon';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from './schema';

const getDb = () => {
    const ctx = getContext();

    return drizzle(ctx.env.DB, { schema });
};

export default getDb;
