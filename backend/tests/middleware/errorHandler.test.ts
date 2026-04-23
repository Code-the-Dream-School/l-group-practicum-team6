import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestError } from '../../src/errors/BadRequestError';
import { ForbiddenError } from '../../src/errors/ForbiddenError';
import { NotFoundError } from '../../src/errors/NotFoundError';
import { UnauthenticatedError } from '../../src/errors/UnauthenticatedError';
import { errorHandler } from '../../src/middleware/errorHandler';

const buildApp = (error: Error) => {
  const app = express();

  app.get('/test', (_req: Request, _res: Response, next: NextFunction) => {
    next(error);
  });

  app.use(errorHandler);

  return app;
};

describe('errorHandler', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    delete process.env.NODE_ENV;
  });

  it('returns 400 for BadRequestError', async () => {
    const app = buildApp(new BadRequestError('Invalid input'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { message: 'Invalid input' }
    });
  });

  it('returns 404 for NotFoundError', async () => {
    const app = buildApp(new NotFoundError('Missing'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { message: 'Missing' }
    });
  });

  it('returns 401 for UnauthenticatedError', async () => {
    const app = buildApp(new UnauthenticatedError('Authentication Invalid'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { message: 'Authentication Invalid' }
    });
  });

  it('returns 403 for ForbiddenError', async () => {
    const app = buildApp(new ForbiddenError('No access'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: { message: 'No access' }
    });
  });

  it('returns real message for generic errors in development', async () => {
    process.env.NODE_ENV = 'development';
    const app = buildApp(new Error('Database exploded'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { message: 'Database exploded' }
    });
  });

  it('hides generic error message in production', async () => {
    process.env.NODE_ENV = 'production';
    const app = buildApp(new Error('Sensitive internal failure'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { message: 'Internal server error' }
    });
  });

  it('logs the error', async () => {
    const app = buildApp(new Error('boom'));

    await request(app).get('/test');

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});