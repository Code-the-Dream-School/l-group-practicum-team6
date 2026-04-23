import { describe, it, expect } from 'vitest';
import { CustomAPIError } from '../../src/errors/CustomAPIError';
import { BadRequestError } from '../../src/errors/BadRequestError';
import { NotFoundError } from '../../src/errors/NotFoundError';
import { UnauthenticatedError } from '../../src/errors/UnauthenticatedError';
import { ForbiddenError } from '../../src/errors/ForbiddenError';

describe('BadRequestError', () => {
  it('extends CustomAPIError and uses status 400', () => {
    const error = new BadRequestError();

    expect(error).toBeInstanceOf(CustomAPIError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad Request');
  });

  it('accepts a custom message', () => {
    const error = new BadRequestError('Email is required');

    expect(error.message).toBe('Email is required');
    expect(error.statusCode).toBe(400);
  });
});

describe('NotFoundError', () => {
  it('extends CustomAPIError and uses status 404', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(CustomAPIError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
  });

  it('accepts a custom message', () => {
    const error = new NotFoundError('User not found');

    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });
});

describe('UnauthenticatedError', () => {
  it('extends CustomAPIError and uses status 401', () => {
    const error = new UnauthenticatedError();

    expect(error).toBeInstanceOf(CustomAPIError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthenticated');
  });

  it('accepts a custom message', () => {
    const error = new UnauthenticatedError('Authentication Invalid');

    expect(error.message).toBe('Authentication Invalid');
    expect(error.statusCode).toBe(401);
  });
});

describe('ForbiddenError', () => {
  it('extends CustomAPIError and uses status 403', () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(CustomAPIError);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });

  it('accepts a custom message', () => {
    const error = new ForbiddenError('Access denied');

    expect(error.message).toBe('Access denied');
    expect(error.statusCode).toBe(403);
  });
});