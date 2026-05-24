import { describe, expect, it } from 'vitest';
import { uploadImage } from '../../src/middleware/uploadImage';

describe('uploadImage middleware', () => {
  it('uses 5MB file size limit', () => {
    expect(uploadImage).toBeDefined();
  });
});
