import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Image from '../../src/models/Image';

let mongoServer: MongoMemoryServer;

describe('Image Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());

    await Image.collection.dropIndexes().catch(() => {
      // ignore if indexes do not exist yet
    });

    // Recreate indexes from the current schema
    await Image.syncIndexes();
  });

  beforeEach(async () => {
    await Image.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('finds an image by owner type and owner ID', async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const fileId = new mongoose.Types.ObjectId();

    await Image.create({
      ownerType: 'user',
      ownerId,
      fileId: fileId,
      filename: 'avatar.png',
      contentType: 'image/png',
      size: 1024,
    });

    const record = await Image.findOne({ ownerType: 'user', ownerId });

    expect(record).toBeTruthy();
    expect(record?.filename).toBe('avatar.png');
  });

  it('fails when creating a second image for the same owner', async () => {
    const ownerId = new mongoose.Types.ObjectId();

    await Image.create({
      ownerType: 'user',
      ownerId,
      fileId: new mongoose.Types.ObjectId(),
      filename: 'first.png',
      contentType: 'image/png',
      size: 1024,
    });

    await expect(
      Image.create({
        ownerType: 'user',
        ownerId,
        fileId: new mongoose.Types.ObjectId(),
        filename: 'second.png',
        contentType: 'image/png',
        size: 2048,
      })
    ).rejects.toMatchObject({
      code: 11000,
    });
  });
});
