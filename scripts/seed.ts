import { seedDatabase } from '../server/src/db/seed.ts';

async function run() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
}

run();
