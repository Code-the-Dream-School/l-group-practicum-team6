/// <reference types="node" />
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../db/connect';
import Visualizer from '../models/Visualizer';

interface SeedEntry {
  shader: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  id: string;
}

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  const seedPath = path.join(__dirname, '..', 'seed', 'visualizers.seed.json');
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const entries: SeedEntry[] = JSON.parse(raw);

  if (!Array.isArray(entries) || entries.length === 0) {
    console.error('Seed file is empty or not an array');
    process.exit(1);
  }

  await connectDB(mongoUri);

  const docs = entries.map((entry, index) => ({
    _id: new mongoose.Types.ObjectId(entry.id),
    name: entry.title,
    glsl: Buffer.from(entry.shader, 'base64').toString('utf-8'),
    tags: entry.categories,
    isDemo: index === 0,
  }));

  const deleted = await Visualizer.deleteMany({});
  console.log(`Removed ${deleted.deletedCount} existing visualizers`);

  const inserted = await Visualizer.insertMany(docs);
  console.log(`Inserted ${inserted.length} visualizers`);
  console.log(`Demo: ${inserted[0].name} (${inserted[0]._id})`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
