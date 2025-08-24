import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import * as schema from './schema';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not set');
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not set');
}

// Use a global singleton for the database client to avoid creating multiple
// connections in development due to Next.js Hot Module Replacement (HMR).
// In production, the module is loaded once, so this has no effect.
declare global {
  // A global variable to hold the client singleton.
  // eslint-disable-next-line no-var
  var __tursoClient: Client | undefined;
}

export const client = globalThis.__tursoClient ?? createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__tursoClient = client;
}

export const db = drizzle(client, { schema });