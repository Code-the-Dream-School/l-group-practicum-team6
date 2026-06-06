import mongoose from 'mongoose';
import { API_ERROR_MESSAGES } from '../../src/constants';
import { describe, it, expect } from 'vitest';
import { validateObjectId } from '../../src/utils/objectIdValidation';
import { BadRequestError } from '../../src/errors';

describe('validateObjectId', () => {
  it('does not throw for a valid ObjectId', () => {
    const id = new mongoose.Types.ObjectId().toString();

    expect(() => validateObjectId(id, API_ERROR_MESSAGES.INVALID_VISUALIZER_ID)).not.toThrow();
  });

  it('throws BadRequestError for invalid id', () => {
    expect(() => validateObjectId('not-an-id', API_ERROR_MESSAGES.INVALID_VISUALIZER_ID)).toThrow(
      BadRequestError
    );
  });

  it('throws the provided error message', () => {
    expect(() => validateObjectId('not-an-id', API_ERROR_MESSAGES.INVALID_VISUALIZER_ID)).toThrow(
      API_ERROR_MESSAGES.INVALID_VISUALIZER_ID
    );
  });
});
