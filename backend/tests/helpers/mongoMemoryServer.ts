import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | undefined;

export async function connectTestDatabase() {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
  });

  await mongoose.connect(mongoServer.getUri());
}

export async function disconnectTestDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = undefined;
  }
}

export async function clearTestDatabase() {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
