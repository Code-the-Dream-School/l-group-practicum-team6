import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import User from '../../src/models/User';

let mongoServer: MongoMemoryServer;
let app: typeof import('../../src/app').default;

const validBody = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'password123',
};

describe('Auth routes', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_LIFETIME = '1d';

    app = (await import('../../src/app')).default;

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.syncIndexes();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    delete process.env.JWT_SECRET;
    delete process.env.JWT_LIFETIME;
  });

  describe('POST /api/v1/auth/register', () => {
    it('creates a user, sets a signed token cookie, and returns 201', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(validBody.email);
      expect(res.body.data.password).toBeUndefined();

      const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
      expect(cookies?.some((c) => c.startsWith('token='))).toBe(true);

      const stored = await User.findOne({ email: validBody.email });
      expect(stored).toBeTruthy();
    });

    it('returns 400 when email is already registered', async () => {
      await request(app).post('/api/v1/auth/register').send(validBody);

      const res = await request(app).post('/api/v1/auth/register').send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Email already exists');
    });

    it.each([
      ['name', { email: 'a@b.co', password: 'password123' }],
      ['email', { name: 'Jane', password: 'password123' }],
      ['password', { name: 'Jane', email: 'a@b.co' }],
      ['all fields', {}],
    ])('returns 400 when %s missing', async (_label, body) => {
      const res = await request(app).post('/api/v1/auth/register').send(body);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Please provide name, email and password');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(validBody);
    });

    it('returns 200 and sets a token cookie with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validBody.email, password: validBody.password });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(validBody.email);

      const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
      expect(cookies?.some((c) => c.startsWith('token='))).toBe(true);
    });

    it('returns 401 for the wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validBody.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid Credentials');
    });

    it('returns 401 for an unknown email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'noone@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid Credentials');
    });

    it.each([
      ['email', { password: 'password123' }],
      ['password', { email: 'a@b.co' }],
      ['both', {}],
    ])('returns 400 when %s missing', async (_label, body) => {
      const res = await request(app).post('/api/v1/auth/login').send(body);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Please provide email and password');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 200 and overwrites the token cookie with logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('user logged out!');

      const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
      expect(cookies?.some((c) => c.startsWith('token=') && c.includes('logout'))).toBe(true);
    });
  });
});
