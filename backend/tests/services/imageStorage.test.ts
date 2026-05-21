import { EventEmitter } from 'events';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';

import { BadRequestError } from '../../src/errors';
import { deleteImage, uploadImage } from '../../src/services/imageStorage';

const gridFSBucketMocks = vi.hoisted(() => ({
  openUploadStream: vi.fn(),
  openDownloadStream: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('mongoose', () => ({
  default: {
    connection: {
      db: {},
    },
  },
}));

vi.mock('mongodb', async () => {
  const actual = await vi.importActual<typeof import('mongodb')>('mongodb');

  class MockGridFSBucket {
    openUploadStream = gridFSBucketMocks.openUploadStream;
    openDownloadStream = gridFSBucketMocks.openDownloadStream;
    delete = gridFSBucketMocks.delete;
  }

  return {
    ...actual,
    GridFSBucket: MockGridFSBucket,
  };
});

function createUploadStream(fileId: ObjectId) {
  const stream = new EventEmitter() as EventEmitter & {
    id: ObjectId;
    end: ReturnType<typeof vi.fn>;
  };

  stream.id = fileId;
  stream.end = vi.fn(() => {
    setImmediate(() => {
      stream.emit('finish');
    });

    return stream;
  });

  return stream;
}

describe('imageStorage service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadImage with a valid PNG buffer returns an ObjectId', async () => {
    const buffer = Buffer.from('fake png content');
    const fileId = new ObjectId();
    const uploadStream = createUploadStream(fileId);

    gridFSBucketMocks.openUploadStream.mockReturnValueOnce(uploadStream);

    const result = await uploadImage(buffer, 'avatar.png', 'image/png');

    expect(result).toBe(fileId);
    expect(gridFSBucketMocks.openUploadStream).toHaveBeenCalledWith('avatar.png', {
      metadata: { contentType: 'image/png' },
    });
    expect(uploadStream.end).toHaveBeenCalledWith(buffer);
  });

  it('uploadImage with an unsupported MIME type throws a BadRequestError', () => {
    const buffer = Buffer.from('not an image');

    expect(() => uploadImage(buffer, 'file.txt', 'text/plain')).toThrow(BadRequestError);
    expect(gridFSBucketMocks.openUploadStream).not.toHaveBeenCalled();
  });

  it('deleteImage with a non-existent fileId resolves without error', async () => {
    const fileId = new ObjectId();

    gridFSBucketMocks.delete.mockRejectedValueOnce(new Error('FileNotFound: file not found'));

    await expect(deleteImage(fileId)).resolves.toBeUndefined();
    expect(gridFSBucketMocks.delete).toHaveBeenCalledWith(fileId);
  });
});
