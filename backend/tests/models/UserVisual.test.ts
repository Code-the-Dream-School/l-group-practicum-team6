import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import User from '../../src/models/User';
import UserVisual from '../../src/models/UserVisual';
import Visualizer from '../../src/models/Visualizer';

let mongoServer: MongoMemoryServer;

describe('UserVisual Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());

    await UserVisual.collection.dropIndexes().catch(() => {
      // ignore if indexes do not exist yet
    });

    await UserVisual.syncIndexes();
  });

  beforeEach(async () => {
    await UserVisual.deleteMany({});
    await User.deleteMany({});
    await Visualizer.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('creates a saved visual with userId, visualizerId, and savedAt', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const visualizer = await Visualizer.create({
      name: 'Test Visualizer',
      source: 'test-source',
      glsl: 'void main() {}',
    });

    const savedVisual = await UserVisual.create({
      userId: user._id,
      visualizerId: visualizer._id,
    });

    expect(savedVisual.userId).toEqual(user._id);
    expect(savedVisual.visualizerId).toEqual(visualizer._id);
    expect(savedVisual.savedAt).toBeInstanceOf(Date);
  });

  it('fails when saving the same visualizer twice for one user', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'password123',
    });

    const visualizer = await Visualizer.create({
      name: 'Duplicate Visualizer',
      source: 'test-source',
      glsl: 'void main() {}',
    });

    await UserVisual.create({
      userId: user._id,
      visualizerId: visualizer._id,
    });

    await expect(
      UserVisual.create({
        userId: user._id,
        visualizerId: visualizer._id,
      })
    ).rejects.toMatchObject({
      code: 11000,
    });
  });

  it('deletes a UserVisual record without deleting the User or Visualizer', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'delete@example.com',
      password: 'password123',
    });

    const visualizer = await Visualizer.create({
      name: 'Delete Test Visualizer',
      source: 'test-source',
      glsl: 'void main() {}',
    });

    const savedVisual = await UserVisual.create({
      userId: user._id,
      visualizerId: visualizer._id,
    });

    await UserVisual.findByIdAndDelete(savedVisual._id);

    const deletedSavedVisual = await UserVisual.findById(savedVisual._id);
    const existingUser = await User.findById(user._id);
    const existingVisualizer = await Visualizer.findById(visualizer._id);

    expect(deletedSavedVisual).toBeNull();
    expect(existingUser).toBeTruthy();
    expect(existingVisualizer).toBeTruthy();
  });
});
