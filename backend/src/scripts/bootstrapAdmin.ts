import 'dotenv/config';

import mongoose from 'mongoose';
import { connectDB } from '../db/connect';
import { ensureAdminUserFromEnv } from '../services/adminBootstrap';

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  await connectDB(mongoUri);
  await ensureAdminUserFromEnv();
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Admin bootstrap failed:', error);
  process.exit(1);
});
