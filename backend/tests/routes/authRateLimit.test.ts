import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { errorHandler } from '../../src/middleware/errorHandler';

vi.mock('../../src/constants', async () => {
  const actual = await vi.importActual<typeof import('../../src/constants')>('../../src/constants');

  return {
    ...actual,
    RATE_LIMIT: {
      ...actual.RATE_LIMIT,
      WINDOW_MS: 60_000,
      AUTH_MAX_NON_PRODUCTION: 1,
      AUTH_MESSAGE: 'Too many requests from this IP, please try again after 15 minutes',
    },
  };
});

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('Auth rate limiter', () => {
  it('returns 429 with custom API error shape after exceeding auth limit', async () => {
    const authRouter = (await import('../../src/routes/auth')).default;

    const app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
    app.use(errorHandler);

    const first = await request(app).post('/api/v1/auth/login').send({});
    expect(first.status).toBe(400);

    const second = await request(app).post('/api/v1/auth/login').send({});
    expect(second.status).toBe(429);
    expect(second.body).toEqual({
      error: {
        message: 'Too many requests from this IP, please try again after 15 minutes',
      },
    });
  });
});
