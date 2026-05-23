import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

declare global {
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL!;

const client =
  global._pgClient ??
  (global._pgClient = postgres(connectionString, {
    prepare: false,
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  }));

export const db = drizzle(client, { schema });
