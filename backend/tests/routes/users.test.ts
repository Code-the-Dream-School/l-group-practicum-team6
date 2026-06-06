import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import User from '../../src/models/User';
import UserVisual from '../../src/models/UserVisual';
import Visualizer from '../../src/models/Visualizer';
import { connectTestDatabase, disconnectTestDatabase } from '../helpers/mongoMemoryServer';

let app: typeof import('../../src/app').default;

const password = 'password123';

async function registerAndLogin(overrides: Partial<{ name: string; email: string }> = {}) {
  const email =
    overrides.email ?? `user-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const name = overrides.name ?? 'Test User';

  await request(app).post('/api/v1/auth/register').send({ name, email, password });

  const user = await User.findOne({ email });
  expect(user).toBeTruthy();

  const agent = request.agent(app);
  const loginRes = await agent.post('/api/v1/auth/login').send({ email, password });
  expect(loginRes.status).toBe(200);

  return { agent, user: user!, email, name };
}

describe('User routes', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_LIFETIME = '1d';

    app = (await import('../../src/app')).default;

    await connectTestDatabase();
    await User.syncIndexes();
    await UserVisual.syncIndexes();
  }, 120000);

  beforeEach(async () => {
    await User.deleteMany({});
    await UserVisual.deleteMany({});
    await Visualizer.deleteMany({});
  });

  afterAll(async () => {
    await disconnectTestDatabase();
    delete process.env.JWT_SECRET;
    delete process.env.JWT_LIFETIME;
  });

  it.each([
    ['GET', '/api/v1/users/user'],
    ['PATCH', '/api/v1/users/user'],
    ['DELETE', '/api/v1/users/user'],
    ['PATCH', '/api/v1/users/user/password'],
    ['GET', '/api/v1/users/current/visuals'],
  ])('rejects unauthenticated %s %s with 401', async (method, url) => {
    const m = method.toLowerCase() as 'get' | 'patch' | 'delete';
    const res = await request(app)[m](url);
    expect(res.status).toBe(401);
  });

  describe('GET /api/v1/users/user', () => {
    it('returns the current authenticated user', async () => {
      const { agent, email } = await registerAndLogin();

      const res = await agent.get('/api/v1/users/user');

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe('PATCH /api/v1/users/user', () => {
    it('updates name and email', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent
        .patch('/api/v1/users/user')
        .send({ name: 'Renamed', email: 'renamed@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Renamed');
      expect(res.body.data.email).toBe('renamed@example.com');
    });

    it('returns 400 when neither name nor email is provided', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent.patch('/api/v1/users/user').send({});

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Please provide name or email');
    });

    it('returns 400 when the new email is already taken', async () => {
      const { agent } = await registerAndLogin();
      await User.create({ name: 'Other', email: 'taken@example.com', password });

      const res = await agent.patch('/api/v1/users/user').send({ email: 'taken@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Email already exists');
    });
  });

  describe('PATCH /api/v1/users/user/password', () => {
    it('updates the password when both fields are valid', async () => {
      const { agent, email } = await registerAndLogin();

      const res = await agent
        .patch('/api/v1/users/user/password')
        .send({ currentPassword: password, newPassword: 'newpassword456' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Password updated');

      const user = await User.findOne({ email });
      await expect(user!.comparePassword('newpassword456')).resolves.toBe(true);
    });

    it.each([
      ['both', {}],
      ['newPassword', { currentPassword: password }],
      ['currentPassword', { newPassword: 'newpassword456' }],
    ])('returns 400 when %s missing', async (_label, body) => {
      const { agent } = await registerAndLogin();

      const res = await agent.patch('/api/v1/users/user/password').send(body);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Please provide all password fields');
    });

    it('returns 400 when newPassword is shorter than 8 chars', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent
        .patch('/api/v1/users/user/password')
        .send({ currentPassword: password, newPassword: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Password must be at least 8 characters');
    });

    it('returns 400 when newPassword equals currentPassword', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent
        .patch('/api/v1/users/user/password')
        .send({ currentPassword: password, newPassword: password });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('New password must be different from current password');
    });

    it('returns 400 when currentPassword is wrong', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent
        .patch('/api/v1/users/user/password')
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword456' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Current password is incorrect');
    });
  });

  describe('DELETE /api/v1/users/user', () => {
    it('deletes the user, cascades userVisuals, and clears the cookie', async () => {
      const { agent, user } = await registerAndLogin();
      const visualizer = await Visualizer.create({ name: 'V', glsl: 'void main() {}' });
      await UserVisual.create({ userId: user._id, visualizerId: visualizer._id });

      const res = await agent.delete('/api/v1/users/user').send({ password });

      expect(res.status).toBe(204);
      expect(await User.findById(user._id)).toBeNull();
      expect(await UserVisual.countDocuments({ userId: user._id })).toBe(0);

      const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
      expect(cookies?.some((c) => c.startsWith('token=') && c.includes('logout'))).toBe(true);
    });

    it('returns 400 when password is not provided', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent.delete('/api/v1/users/user').send({});

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Please provide password');
    });

    it('returns 400 when password is wrong', async () => {
      const { agent, user } = await registerAndLogin();

      const res = await agent.delete('/api/v1/users/user').send({ password: 'wrongpassword' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Invalid password');
      expect(await User.findById(user._id)).not.toBeNull();
    });
  });

  describe('GET /api/v1/users/current/visuals', () => {
    it('returns the user-saved visualizers populated', async () => {
      const { agent, user } = await registerAndLogin();
      const a = await Visualizer.create({ name: 'A', glsl: 'void main() {}' });
      const b = await Visualizer.create({ name: 'B', glsl: 'void main() {}' });
      await UserVisual.create({ userId: user._id, visualizerId: a._id });
      await UserVisual.create({ userId: user._id, visualizerId: b._id });

      const res = await agent.get('/api/v1/users/current/visuals');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      const names = (res.body.data as { visualizerId: { name: string } }[])
        .map((v) => v.visualizerId.name)
        .sort();
      expect(names).toEqual(['A', 'B']);
    });

    it('returns an empty list when nothing saved', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent.get('/api/v1/users/current/visuals');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/v1/users/current/visuals/:id', () => {
    it('returns 400 for an invalid ObjectId', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent.post('/api/v1/users/current/visuals/not-an-id');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Invalid visualizer ID');
    });

    it('returns 404 when the visualizer does not exist', async () => {
      const { agent } = await registerAndLogin();
      const missing = new mongoose.Types.ObjectId().toString();

      const res = await agent.post(`/api/v1/users/current/visuals/${missing}`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Visualizer not found');
    });

    it('saves the visualizer to the user collection', async () => {
      const { agent, user } = await registerAndLogin();
      const visualizer = await Visualizer.create({ name: 'V', glsl: 'void main() {}' });

      const res = await agent.post(`/api/v1/users/current/visuals/${visualizer._id.toString()}`);

      expect(res.status).toBe(201);
      const stored = await UserVisual.findOne({ userId: user._id, visualizerId: visualizer._id });
      expect(stored).toBeTruthy();
    });

    it('returns 400 when the visualizer is already saved', async () => {
      const { agent, user } = await registerAndLogin();
      const visualizer = await Visualizer.create({ name: 'V', glsl: 'void main() {}' });
      await UserVisual.create({ userId: user._id, visualizerId: visualizer._id });

      const res = await agent.post(`/api/v1/users/current/visuals/${visualizer._id.toString()}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Visualizer already in collection');
    });
  });

  describe('DELETE /api/v1/users/current/visuals/:id', () => {
    it('returns 400 for an invalid ObjectId', async () => {
      const { agent } = await registerAndLogin();

      const res = await agent.delete('/api/v1/users/current/visuals/not-an-id');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Invalid visualizer ID');
    });

    it('returns 404 when nothing to remove', async () => {
      const { agent } = await registerAndLogin();
      const missing = new mongoose.Types.ObjectId().toString();

      const res = await agent.delete(`/api/v1/users/current/visuals/${missing}`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Visualizer not found in collection');
    });

    it('removes the visualizer from the user collection', async () => {
      const { agent, user } = await registerAndLogin();
      const visualizer = await Visualizer.create({ name: 'V', glsl: 'void main() {}' });
      await UserVisual.create({ userId: user._id, visualizerId: visualizer._id });

      const res = await agent.delete(`/api/v1/users/current/visuals/${visualizer._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Removed from collection');
      expect(
        await UserVisual.findOne({ userId: user._id, visualizerId: visualizer._id })
      ).toBeNull();
    });
  });
});
