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

interface JsonVisualizerEntry {
  shader: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  id: string;
}

const ADMIN_FAVORITES_COUNT = 5;

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

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin user');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[skip] admin ${email} (already exists)`);
    return;
  }

  const user = new User({ email, name, password });
  await user.save();
  console.log(`[+] admin ${email}`);
}

async function seedAdminFavorites(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  if (!email) return;

  const admin = await User.findOne({ email });
  if (!admin) {
    console.warn(`[warn] admin ${email} not found, skipping favorites`);
    return;
  }

  const firstVisualizers = await Visualizer.find()
    .sort({ _id: 1 })
    .limit(ADMIN_FAVORITES_COUNT)
    .select('_id name');

  for (const visualizer of firstVisualizers) {
    const exists = await UserVisual.findOne({ userId: admin._id, visualizerId: visualizer._id });
    if (exists) {
      console.log(`[skip] favorite ${email} -> ${visualizer.name}`);
      continue;
    }
    await UserVisual.create({ userId: admin._id, visualizerId: visualizer._id });
    console.log(`[+] favorite ${email} -> ${visualizer.name}`);
  }
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run seed in production');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  const seedDir = path.resolve(__dirname, '..', 'seed');
  const visualizersSeedPath = path.join(seedDir, 'visualizers.seed.json');
  const previewsDir = path.resolve(__dirname, '..', '..', 'public', 'previews');

  let jsonVisualizers: JsonVisualizerEntry[];
  try {
    jsonVisualizers = JSON.parse(fs.readFileSync(visualizersSeedPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to read visualizers.seed.json');
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

  await seedJsonVisualizers(jsonVisualizers, bucket, previewsDir);
  await seedAdmin();
  await seedAdminFavorites();

  console.log('Seed complete');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
