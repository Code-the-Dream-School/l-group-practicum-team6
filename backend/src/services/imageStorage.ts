import { GridFSBucketReadStream, ObjectId } from 'mongodb';

import { validateImageSize, validateImageType } from '../utils/imageValidation';

import { uploadBufferToGridFS, deleteGridFSFile, openGridFSDownloadStream } from '../utils/gridfs';

const IMAGE_BUCKET_NAME = 'images';

export function uploadImage(
  buffer: Buffer,
  originalname: string,
  mimetype: string
): Promise<ObjectId> {
  validateImageType(mimetype);
  validateImageSize(buffer.length);

  return uploadBufferToGridFS(buffer, originalname, mimetype, IMAGE_BUCKET_NAME);
}

export function openDownloadStream(fileId: ObjectId): GridFSBucketReadStream {
  return openGridFSDownloadStream(fileId, IMAGE_BUCKET_NAME);
}

export async function deleteImage(fileId: ObjectId): Promise<void> {
  try {
    await deleteGridFSFile(fileId, IMAGE_BUCKET_NAME);
  } catch (error) {
    if (error instanceof Error && error.message.includes('FileNotFound')) {
      return;
    }

    throw error;
  }
}
