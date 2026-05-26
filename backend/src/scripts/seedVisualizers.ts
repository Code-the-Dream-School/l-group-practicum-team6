/// <reference types="node" />

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { connectDB } from '../db/connect';
import Visualizer from '../models/Visualizer';
import Image from '../models/Image';
import User from '../models/User';
import UserVisual from '../models/UserVisual';
import { extraVisualizerFixtures } from '../seed/visualizers-extra.seed';

interface JsonVisualizerEntry {
  shader: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  id: string;
}

interface UserSeed {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
}

interface UserVisualSeed {
  userEmail: string;
  visualizerId: string;
}

const RESET_FLAG = '--reset';

async function uploadPng(
  bucket: GridFSBucket,
  filePath: string,
  filename: string
): Promise<mongoose.Types.ObjectId> {
  return new Promise((resolve, reject) => {
    const upload = bucket.openUploadStream(filename);
    fs.createReadStream(filePath)
      .pipe(upload)
      .on('finish', () => resolve(upload.id as mongoose.Types.ObjectId))
      .on('error', reject);
  });
}

async function resetDatabase(bucket: GridFSBucket): Promise<void> {
  console.log('--reset: dropping collections and GridFS bucket');
  await Promise.all([
    Visualizer.deleteMany({}),
    Image.deleteMany({}),
    User.deleteMany({}),
    UserVisual.deleteMany({}),
  ]);
  try {
    await bucket.drop();
  } catch {
    // bucket didn't exist
  }
}

async function seedJsonVisualizers(
  entries: JsonVisualizerEntry[],
  bucket: GridFSBucket,
  previewsDir: string
): Promise<void> {
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const visualizerId = new mongoose.Types.ObjectId(entry.id);

    const exists = await Visualizer.findById(visualizerId);
    if (exists) {
      console.log(`[skip] visualizer ${entry.title} (already exists)`);
      continue;
    }

    const pngPath = path.join(previewsDir, entry.image);
    const size = fs.statSync(pngPath).size;
    const fileId = await uploadPng(bucket, pngPath, entry.image);
    const image = await Image.create({
      ownerType: 'visualizer',
      ownerId: visualizerId,
      fileId,
      filename: entry.image,
      contentType: 'image/png',
      size,
    });

    await Visualizer.create({
      _id: visualizerId,
      name: entry.title,
      glsl: Buffer.from(entry.shader, 'base64').toString('utf-8'),
      tags: entry.categories,
      isDemo: index === 0,
      imageUrl: image._id,
    });

    console.log(`[+] visualizer ${entry.title}`);
  }
}

async function seedExtraVisualizers(): Promise<void> {
  for (const fixture of extraVisualizerFixtures) {
    const id = new mongoose.Types.ObjectId(fixture.id);
    const exists = await Visualizer.findById(id);
    if (exists) {
      console.log(`[skip] extra visualizer ${fixture.name} (already exists)`);
      continue;
    }
    await Visualizer.create({
      _id: id,
      name: fixture.name,
      source: fixture.source,
      glsl: fixture.glsl,
      tags: fixture.tags,
      isDemo: false,
    });
    console.log(`[+] extra visualizer ${fixture.name}`);
  }
}

async function seedUsers(users: UserSeed[]): Promise<void> {
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`[skip] user ${u.email} (already exists)`);
      continue;
    }
    // User model has no `role` field yet — kept in seed JSON for future use.
    const user = new User({ email: u.email, name: u.name, password: u.password });
    await user.save();
    console.log(`[+] user ${u.email}`);
  }
}

async function seedUserVisuals(mappings: UserVisualSeed[]): Promise<void> {
  for (const m of mappings) {
    const user = await User.findOne({ email: m.userEmail });
    if (!user) {
      console.warn(`[warn] userVisual: user ${m.userEmail} not found, skipping`);
      continue;
    }
    const visualizerId = new mongoose.Types.ObjectId(m.visualizerId);
    const visualizer = await Visualizer.findById(visualizerId);
    if (!visualizer) {
      console.warn(`[warn] userVisual: visualizer ${m.visualizerId} not found, skipping`);
      continue;
    }
    const exists = await UserVisual.findOne({ userId: user._id, visualizerId });
    if (exists) {
      console.log(`[skip] userVisual ${m.userEmail} -> ${visualizer.name}`);
      continue;
    }
    await UserVisual.create({ userId: user._id, visualizerId });
    console.log(`[+] userVisual ${m.userEmail} -> ${visualizer.name}`);
  }
}

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  const reset = process.argv.includes(RESET_FLAG);

  const seedDir = path.resolve(__dirname, '..', 'seed');
  const visualizersSeedPath = path.join(seedDir, 'visualizers.seed.json');
  const usersSeedPath = path.join(seedDir, 'users.seed.json');
  const userVisualsSeedPath = path.join(seedDir, 'userVisuals.seed.json');
  const previewsDir = path.resolve(__dirname, '..', '..', 'public', 'previews');

  let jsonVisualizers: JsonVisualizerEntry[];
  let users: UserSeed[];
  let userVisuals: UserVisualSeed[];
  try {
    jsonVisualizers = JSON.parse(fs.readFileSync(visualizersSeedPath, 'utf-8'));
    users = JSON.parse(fs.readFileSync(usersSeedPath, 'utf-8'));
    userVisuals = JSON.parse(fs.readFileSync(userVisualsSeedPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to read seed files');
    console.error(error);
    process.exit(1);
  }

  if (!Array.isArray(jsonVisualizers) || jsonVisualizers.length === 0) {
    console.error('visualizers.seed.json is empty or invalid');
    process.exit(1);
  }

  for (const entry of jsonVisualizers) {
    const pngPath = path.join(previewsDir, entry.image);
    if (!fs.existsSync(pngPath)) {
      console.error(`Missing preview: ${entry.image}`);
      console.error(`Place PNG previews in ${previewsDir} before seeding.`);
      process.exit(1);
    }
  }

  await connectDB(mongoUri);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Mongo connection not ready');
  }
  const bucket = new GridFSBucket(db, { bucketName: 'images' });

  if (reset) {
    await resetDatabase(bucket);
  }

  await seedJsonVisualizers(jsonVisualizers, bucket, previewsDir);
  await seedExtraVisualizers();
  await seedUsers(users);
  await seedUserVisuals(userVisuals);

  console.log('Seed complete');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
