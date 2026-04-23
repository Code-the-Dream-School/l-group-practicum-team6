import { describe, it, expect } from 'vitest';
import { CustomAPIError } from '../../src/errors/CustomAPIError';

describe('CustomAPIError', () => {
  it('is an instance of Error', () => {
    const error = new CustomAPIError('boom', 500);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CustomAPIError);
  });

  it('stores message and statusCode', () => {
    const error = new CustomAPIError('Something went wrong', 500);

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
  });

  it('sets the name correctly', () => {
    const error = new CustomAPIError('boom', 500);

    expect(error.name).toBe('CustomAPIError');
  });
});