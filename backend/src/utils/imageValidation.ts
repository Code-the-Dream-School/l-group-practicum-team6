import { BadRequestError } from '../errors';
import { API_ERROR_MESSAGES } from '@sonix/shared';

export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageType(mimetype: string): void {
  if (!ALLOWED_IMAGE_TYPES.has(mimetype)) {
    throw new BadRequestError(API_ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE);
  }
}

export function validateImageSize(size: number): void {
  if (size > MAX_IMAGE_SIZE_BYTES) {
    throw new BadRequestError(API_ERROR_MESSAGES.IMAGE_SIZE_EXCEEDS_LIMIT);
  }
}
