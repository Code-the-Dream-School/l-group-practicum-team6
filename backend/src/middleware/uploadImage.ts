import multer from 'multer';
import { BadRequestError } from '../errors';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new BadRequestError('Unsupported file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
      return;
    }
    cb(null, true);
  },
});
