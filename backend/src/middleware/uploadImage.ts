import multer from 'multer';
import { API_ERROR_MESSAGES } from '@sonix/shared';
import { MAX_IMAGE_SIZE_BYTES, validateImageType } from '../utils/imageValidation';

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    try {
      validateImageType(file.mimetype);
      cb(null, true);
    } catch (error) {
      cb(error instanceof Error ? error : new Error(API_ERROR_MESSAGES.INVALID_FILE_TYPE));
    }
  },
});
