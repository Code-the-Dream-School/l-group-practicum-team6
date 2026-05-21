/// <reference types="node" />

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { connectDB } from '../db/connect';
import Visualizer from '../models/Visualizer';
import Image from '../models/Image';

interface SeedEntry {
  shader: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  id: string;
}

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

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  const seedPath = path.resolve(__dirname, '..', 'seed', 'visualizers.seed.json');
  const previewsDir = path.resolve(__dirname, '..', '..', 'public', 'previews');

  let entries: SeedEntry[];
  try {
    const raw = fs.readFileSync(seedPath, 'utf-8');
    entries = JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read or parse seed file: ${seedPath}`);
    console.error(error);
    process.exit(1);
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    console.error('Seed file is empty or not an array');
    process.exit(1);
  }

  // Verify all png files exist locally before connecting
  for (const entry of entries) {
    const pngPath = path.join(previewsDir, entry.image);
    if (!fs.existsSync(pngPath)) {
      console.error(`Missing preview file: ${entry.image}`);
      console.error(`Place all PNG previews in ${previewsDir} before running seed.`);
      process.exit(1);
    }
  }

  await connectDB(mongoUri);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Mongo connection is not ready');
  }
  const bucket = new GridFSBucket(db, { bucketName: 'images' });

  // Wipe previous run
  await Visualizer.deleteMany({});
  await Image.deleteMany({});
  try {
    await bucket.drop();
  } catch {
    // bucket didn't exist yet, ignore
  }
  console.log('Cleaned old data');

  // For each entry upload png -> Image doc -> Visualizer doc with imageUrl ref
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const visualizerId = new mongoose.Types.ObjectId(entry.id);
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

    console.log(`[${index + 1}/${entries.length}] ${entry.title} -> image ${image._id}`);
  }

  console.log(`Inserted ${entries.length} visualizers with linked GridFS images`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
