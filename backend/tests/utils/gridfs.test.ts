import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  uploadBufferToGridFS,
  deleteGridFSFile,
  openGridFSDownloadStream,
} from '../../src/utils/gridfs';

let mongoServer: MongoMemoryServer;

function getTestDB() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection not established');
  }

  return db;
}

describe('gridfs utils', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    const db = getTestDB();

    await db.collection('images.files').deleteMany({});
    await db.collection('images.chunks').deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('uploads a file to GridFS', async () => {
    const buffer = Buffer.from('test image content');

    const fileId = await uploadBufferToGridFS(buffer, 'avatar.png', 'image/png', 'images');

    expect(fileId).toBeDefined();

    const files = await getTestDB().collection('images.files').find().toArray();

    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('avatar.png');
    expect(files[0].metadata.contentType).toBe('image/png');
  });

  it('streams a GridFS file', async () => {
    const buffer = Buffer.from('stream test');

    const fileId = await uploadBufferToGridFS(buffer, 'stream.png', 'image/png', 'images');

    const stream = openGridFSDownloadStream(fileId.toString(), 'images');

    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      stream.on('end', () => {
        resolve();
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });

    const result = Buffer.concat(chunks).toString();

    expect(result).toBe('stream test');
  });

  it('deletes a GridFS file', async () => {
    const buffer = Buffer.from('delete test');

    const fileId = await uploadBufferToGridFS(buffer, 'delete.png', 'image/png', 'images');

    await deleteGridFSFile(fileId.toString(), 'images');

    const files = await getTestDB().collection('images.files').find().toArray();

    expect(files).toHaveLength(0);
  });
});
