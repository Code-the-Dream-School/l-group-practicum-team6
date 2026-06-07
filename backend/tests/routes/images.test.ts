import mongoose from 'mongoose';
import request from 'supertest';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import Image from '../../src/models/Image';
import User from '../../src/models/User';
import { connectTestDatabase, disconnectTestDatabase } from '../helpers/mongoMemoryServer';

let app: typeof import('../../src/app').default;

describe('Image routes', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_LIFETIME = '1d';

    app = (await import('../../src/app')).default;

    await connectTestDatabase();

    await Image.collection.dropIndexes().catch(() => {});
    await Image.syncIndexes();
  }, 120000);

  beforeEach(async () => {
    await Image.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await disconnectTestDatabase();

    delete process.env.JWT_SECRET;
    delete process.env.JWT_LIFETIME;
  });

  async function createAuthenticatedAgent() {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';

    await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email,
      password,
    });

    const user = await User.findOne({ email });

    expect(user).toBeTruthy();

    const agent = request.agent(app);

    const loginRes = await agent.post('/api/v1/auth/login').send({
      email,
      password,
    });

    expect(loginRes.status).toBe(200);

    return {
      user: user!,
      agent,
    };
  }

  it('returns 400 when uploading a PDF', async () => {
    const { agent } = await createAuthenticatedAgent();

    const res = await agent
      .post('/api/v1/images/users/current')
      .attach('image', Buffer.from('fake pdf'), {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Unsupported file type');
  });

  it('returns 400 when uploading a file larger than 5 MB', async () => {
    const { agent } = await createAuthenticatedAgent();

    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);

    const res = await agent.post('/api/v1/images/users/current').attach('image', largeBuffer, {
      filename: 'large.png',
      contentType: 'image/png',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('File too large');
  });

  it('returns 404 when streaming a non-existent user image', async () => {
    const missingUserId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/v1/images/users/${missingUserId.toString()}`);

    expect(res.status).toBe(404);
  });

  it('uploads a user avatar and returns imageId', async () => {
    const { user, agent } = await createAuthenticatedAgent();

    const res = await agent
      .post('/api/v1/images/users/current')
      .attach('image', Buffer.from('fake image'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.imageId).toBeDefined();

    const image = await Image.findOne({
      ownerType: 'user',
      ownerId: user._id,
    });

    expect(image).toBeTruthy();
    expect(image?.filename).toBe('avatar.png');
    expect(image?.contentType).toBe('image/png');
  });

  it('streams an existing user image and sets Content-Type', async () => {
    const { user, agent } = await createAuthenticatedAgent();

    await agent.post('/api/v1/images/users/current').attach('image', Buffer.from('fake image'), {
      filename: 'avatar.png',
      contentType: 'image/png',
    });

    const res = await request(app).get(`/api/v1/images/users/${user._id.toString()}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
  });

  it('replaces old avatar without leaving duplicate Image records', async () => {
    const { user, agent } = await createAuthenticatedAgent();

    await agent.post('/api/v1/images/users/current').attach('image', Buffer.from('first image'), {
      filename: 'first.png',
      contentType: 'image/png',
    });

    const firstImage = await Image.findOne({
      ownerType: 'user',
      ownerId: user._id,
    });

    expect(firstImage).toBeTruthy();

    await agent.post('/api/v1/images/users/current').attach('image', Buffer.from('second image'), {
      filename: 'second.png',
      contentType: 'image/png',
    });

    const images = await Image.find({
      ownerType: 'user',
      ownerId: user._id,
    });

    expect(images).toHaveLength(1);
    expect(images[0].filename).toBe('second.png');

    expect(images[0].fileId.toString()).not.toBe(firstImage!.fileId.toString());
  });

  it('deletes user avatar image', async () => {
    const { user, agent } = await createAuthenticatedAgent();

    await agent.post('/api/v1/images/users/current').attach('image', Buffer.from('avatar image'), {
      filename: 'avatar.png',
      contentType: 'image/png',
    });

    const res = await agent.delete('/api/v1/images/users/current');

    expect(res.status).toBe(204);

    const image = await Image.findOne({
      ownerType: 'user',
      ownerId: user._id,
    });

    expect(image).toBeNull();
  });

  it('returns 404 when streaming a non-existent visualizer image', async () => {
    const missingVisualizerId = new mongoose.Types.ObjectId();

    const res = await request(app).get(
      `/api/v1/images/visualizers/${missingVisualizerId.toString()}`
    );

    expect(res.status).toBe(404);
  });
});
