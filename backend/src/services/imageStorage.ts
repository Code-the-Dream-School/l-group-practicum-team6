import mongoose from 'mongoose';
import { GridFSBucket, GridFSBucketReadStream, ObjectId } from 'mongodb';

import { BadRequestError } from '../errors';

const IMAGE_BUCKET_NAME = 'images';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function getImagesBucket(): GridFSBucket {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('MongoDB connection is not ready');
  }

  return new GridFSBucket(db, { bucketName: IMAGE_BUCKET_NAME });
}

function validateImage(buffer: Buffer, mimetype: string): void {
  if (!ALLOWED_IMAGE_TYPES.has(mimetype)) {
    throw new BadRequestError('Unsupported image type');
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    throw new BadRequestError('Image size exceeds 5 MB limit');
  }
}

export function uploadImage(
  buffer: Buffer,
  originalname: string,
  mimetype: string
): Promise<ObjectId> {
  validateImage(buffer, mimetype);

  const bucket = getImagesBucket();
  const uploadStream = bucket.openUploadStream(originalname, {
    metadata: { contentType: mimetype },
  });

  return new Promise((resolve, reject) => {
    uploadStream.end(buffer);

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.on('error', reject);
  });
}

export function openDownloadStream(fileId: ObjectId): GridFSBucketReadStream {
  const bucket = getImagesBucket();

  return bucket.openDownloadStream(fileId);
}

export async function deleteImage(fileId: ObjectId): Promise<void> {
  const bucket = getImagesBucket();

  try {
    await bucket.delete(fileId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('FileNotFound')) {
      return;
    }

    throw error;
  }
}
