import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { jobs as mockJobs, categories as mockCategories, locations as mockLocations } from '../lib/mockData';

// This is a separate script to run from the command line
// It requires environment variables to be set, e.g., using a .env file
import 'dotenv/config';

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is not set for seeding');
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN is not set for seeding');
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client, { schema });

  console.log('Seeding database...');
  
  console.log('Seeding categories...');
  await db.insert(schema.categories).values(mockCategories).onConflictDoNothing();

  console.log('Seeding locations...');
  await db.insert(schema.locations).values(mockLocations).onConflictDoNothing();
  
  console.log('Seeding jobs...');
  await db.insert(schema.jobs).values(mockJobs).onConflictDoNothing();

  console.log('Database seeded successfully!');
}

main().catch((e) => {
  console.error('Failed to seed database:', e);
  (process as any).exit(1);
});