import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '../../src/errors/NotFoundError';
import { errorHandler } from '../../src/middleware/errorHandler';
import { notFound } from '../../src/middleware/notFound';

describe('notFound', () => {
  it('passes a NotFoundError to next()', () => {
    const next = vi.fn();

    notFound({} as Request, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
  });

  it('returns 404 when used with errorHandler', async () => {
    const app = express();

    app.use(notFound);
    app.use(errorHandler);

    const res = await request(app).get('/missing-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { message: 'Not found' }
    });
  });
});