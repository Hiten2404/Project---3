import 'dotenv/config';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db, client } from './index';

async function main() {
  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations finished!');
  
  client.close();
  (process as any).exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  client.close();
  (process as any).exit(1);
});