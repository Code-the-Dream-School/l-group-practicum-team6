import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import User from '../../src/models/User';
import Visualizer from '../../src/models/Visualizer';

let mongoServer: MongoMemoryServer;
let app: typeof import('../../src/app').default;

async function createAuthedAgent() {
  const email = `viz-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const password = 'password123';
  await request(app).post('/api/v1/auth/register').send({
    name: 'Viz Tester',
    email,
    password,
  });

  const agent = request.agent(app);
  const loginRes = await agent.post('/api/v1/auth/login').send({ email, password });
  expect(loginRes.status).toBe(200);
  return agent;
}

async function seed() {
  await Visualizer.create([
    { name: 'Demo One', glsl: 'void main() {}', isDemo: true, tags: ['plasma', 'classic'] },
    { name: 'Wave', glsl: 'void main() {}', tags: ['plasma'] },
    { name: 'Tunnel', glsl: 'void main() {}', tags: ['radial'] },
    { name: 'Fractal Storm', glsl: 'void main() {}', tags: ['fractal'] },
    { name: 'Wave Grid', glsl: 'void main() {}', tags: ['lines'] },
  ]);
}

describe('Visualizer routes', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_LIFETIME = '1d';

    app = (await import('../../src/app')).default;

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.syncIndexes();
  });

  beforeEach(async () => {
    await Visualizer.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    delete process.env.JWT_SECRET;
    delete process.env.JWT_LIFETIME;
  });

  describe('GET /api/v1/visualizers', () => {
    it('returns a paginated list with default page=1, limit=12', async () => {
      await seed();

      const res = await request(app).get('/api/v1/visualizers');

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.total).toBe(5);
      expect(res.body.pages).toBe(1);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.data[0].glsl).toBeUndefined();
    });

    it('honours page and limit query params', async () => {
      await seed();

      const res = await request(app).get('/api/v1/visualizers').query({ page: 2, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pages).toBe(3);
    });

    it('filters by name with the search query (case-insensitive)', async () => {
      await seed();

      const res = await request(app).get('/api/v1/visualizers').query({ search: 'wave' });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      const names = (res.body.data as { name: string }[]).map((v) => v.name).sort();
      expect(names).toEqual(['Wave', 'Wave Grid']);
    });

    it('filters by tag', async () => {
      await seed();

      const res = await request(app).get('/api/v1/visualizers').query({ tag: 'plasma' });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      const names = (res.body.data as { name: string }[]).map((v) => v.name).sort();
      expect(names).toEqual(['Demo One', 'Wave']);
    });

    it('returns an empty list and total=0 when filter matches nothing', async () => {
      await seed();

      const res = await request(app).get('/api/v1/visualizers').query({ tag: 'no-such-tag' });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/v1/visualizers/demo', () => {
    it('returns the demo visualizer when one exists', async () => {
      await seed();

      const res = await request(app).get('/api/v1/visualizers/demo');

      expect(res.status).toBe(200);
      expect(res.body.data.isDemo).toBe(true);
      expect(res.body.data.name).toBe('Demo One');
    });

    it('returns 404 when no demo visualizer exists', async () => {
      const res = await request(app).get('/api/v1/visualizers/demo');

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('No demo visualizer found');
    });
  });

  describe('GET /api/v1/visualizers/tags', () => {
    it('returns the sorted unique tag list', async () => {
      await seed();

      const res = await request(app).get('/api/v1/visualizers/tags');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(['classic', 'fractal', 'lines', 'plasma', 'radial']);
    });
  });

  describe('GET /api/v1/visualizers/:id', () => {
    it('returns 401 without an auth cookie', async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const res = await request(app).get(`/api/v1/visualizers/${id}`);

      expect(res.status).toBe(401);
    });

    it('returns 404 for a non-existent id when authed', async () => {
      const agent = await createAuthedAgent();
      const id = new mongoose.Types.ObjectId().toString();

      const res = await agent.get(`/api/v1/visualizers/${id}`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Visualizer not found');
    });

    it('returns the full visualizer when authed and found', async () => {
      const agent = await createAuthedAgent();
      const visualizer = await Visualizer.create({
        name: 'Solo',
        glsl: 'void main() { /* secret */ }',
        tags: ['unique'],
      });

      const res = await agent.get(`/api/v1/visualizers/${visualizer._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Solo');
      expect(res.body.data.glsl).toContain('secret');
    });
  });
});
