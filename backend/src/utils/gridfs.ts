import mongoose from 'mongoose';
import { GridFSBucket, GridFSBucketReadStream, ObjectId } from 'mongodb';
import { Readable } from 'stream';

type BucketName = 'images' | 'shaders';
type GridFSFileId = string | mongoose.Types.ObjectId | ObjectId;

export function getGridFSBucket(bucketName: BucketName = 'images'): GridFSBucket {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection is not ready');
  }

  return new GridFSBucket(db, {
    bucketName,
  });
}

export function uploadBufferToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string,
  bucketName: BucketName = 'images'
): Promise<ObjectId> {
  const bucket = getGridFSBucket(bucketName);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        contentType,
      },
    });

    Readable.from(buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id as ObjectId);
      });
  });
}

export async function deleteGridFSFile(
  fileId: GridFSFileId,
  bucketName: BucketName = 'images'
): Promise<void> {
  const bucket = getGridFSBucket(bucketName);
  await bucket.delete(new ObjectId(fileId.toString()));
}

export function openGridFSDownloadStream(
  fileId: GridFSFileId,
  bucketName: BucketName = 'images'
): GridFSBucketReadStream {
  const bucket = getGridFSBucket(bucketName);
  return bucket.openDownloadStream(new ObjectId(fileId.toString()));
}
