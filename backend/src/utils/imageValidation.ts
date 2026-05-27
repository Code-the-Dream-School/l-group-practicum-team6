import { BadRequestError } from '../errors';

export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageType(mimetype: string): void {
  if (!ALLOWED_IMAGE_TYPES.has(mimetype)) {
    throw new BadRequestError('Unsupported file type');
  }
}

export function validateImageSize(size: number): void {
  if (size > MAX_IMAGE_SIZE_BYTES) {
    throw new BadRequestError('Image size exceeds 5 MB limit');
  }
}
