import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';

import { BadRequestError } from '../../src/errors';

vi.mock('../../src/utils/gridfs', () => ({
  uploadBufferToGridFS: vi.fn(),
  openGridFSDownloadStream: vi.fn(),
  deleteGridFSFile: vi.fn(),
}));

import {
  uploadBufferToGridFS,
  openGridFSDownloadStream,
  deleteGridFSFile,
} from '../../src/utils/gridfs';

import { deleteImage, openDownloadStream, uploadImage } from '../../src/services/imageStorage';

const mockedUploadBufferToGridFS = vi.mocked(uploadBufferToGridFS);
const mockedOpenGridFSDownloadStream = vi.mocked(openGridFSDownloadStream);
const mockedDeleteGridFSFile = vi.mocked(deleteGridFSFile);

describe('imageStorage service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadImage with a valid PNG buffer returns an ObjectId', async () => {
    const buffer = Buffer.from('fake png content');
    const fileId = new ObjectId();

    mockedUploadBufferToGridFS.mockResolvedValueOnce(fileId);

    const result = await uploadImage(buffer, 'avatar.png', 'image/png');

    expect(result).toBe(fileId);
    expect(mockedUploadBufferToGridFS).toHaveBeenCalledWith(
      buffer,
      'avatar.png',
      'image/png',
      'images'
    );
  });

  it('uploadImage with an unsupported MIME type throws a BadRequestError', () => {
    const buffer = Buffer.from('not an image');

    expect(() => uploadImage(buffer, 'file.txt', 'text/plain')).toThrow(BadRequestError);
    expect(mockedUploadBufferToGridFS).not.toHaveBeenCalled();
  });

  it('uploadImage with a file larger than 5MB throws a BadRequestError', () => {
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);

    expect(() => uploadImage(largeBuffer, 'large.png', 'image/png')).toThrow(BadRequestError);
    expect(mockedUploadBufferToGridFS).not.toHaveBeenCalled();
  });

  it('openDownloadStream opens the images bucket download stream', () => {
    const fileId = new ObjectId();
    const stream = { pipe: vi.fn() };

    mockedOpenGridFSDownloadStream.mockReturnValueOnce(stream as any);

    const result = openDownloadStream(fileId);

    expect(result).toBe(stream);
    expect(mockedOpenGridFSDownloadStream).toHaveBeenCalledWith(fileId, 'images');
  });

  it('deleteImage deletes the GridFS file from the image bucket', async () => {
    const fileId = new ObjectId();

    await deleteImage(fileId);

    expect(mockedDeleteGridFSFile).toHaveBeenCalledWith(fileId, 'images');
  });

  it('deleteImage with a non-existent fileId resolves without error', async () => {
    const fileId = new ObjectId();

    mockedDeleteGridFSFile.mockRejectedValueOnce(new Error('FileNotFound: file not found'));

    await expect(deleteImage(fileId)).resolves.toBeUndefined();
    expect(mockedDeleteGridFSFile).toHaveBeenCalledWith(fileId, 'images');
  });
});
