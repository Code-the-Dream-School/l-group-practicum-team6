import mongoose from 'mongoose';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  uploadUserImage,
  getUserImage,
  deleteUserImage,
  getVisualizerImage,
} from '../../src/controllers/images';
import { BadRequestError, NotFoundError } from '../../src/errors';

vi.mock('../../src/models/Image', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('../../src/models/User', () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../../src/utils/gridfs', () => ({
  uploadBufferToGridFS: vi.fn(),
  deleteGridFSFile: vi.fn(),
  openGridFSDownloadStream: vi.fn(),
}));

import Image from '../../src/models/Image';
import User from '../../src/models/User';
import {
  uploadBufferToGridFS,
  deleteGridFSFile,
  openGridFSDownloadStream,
} from '../../src/utils/gridfs';

const mockedImage = vi.mocked(Image);
const mockedUser = vi.mocked(User);
const mockedUploadBufferToGridFS = vi.mocked(uploadBufferToGridFS);
const mockedDeleteGridFSFile = vi.mocked(deleteGridFSFile);
const mockedOpenGridFSDownloadStream = vi.mocked(openGridFSDownloadStream);

function createMockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  };
}

describe('images controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadUserImage throws BadRequestError when file is missing', async () => {
    const req = {
      user: { userId: new mongoose.Types.ObjectId().toString() },
    };

    const res = createMockResponse();

    await expect(uploadUserImage(req as any, res as any)).rejects.toBeInstanceOf(BadRequestError);
  });

  it('uploadUserImage uploads file, creates Image record, and returns imageId', async () => {
    const userId = new mongoose.Types.ObjectId();
    const fileId = new mongoose.Types.ObjectId();
    const imageId = new mongoose.Types.ObjectId();

    mockedImage.findOne.mockResolvedValue(null as any);
    mockedUploadBufferToGridFS.mockResolvedValue(fileId as any);
    mockedImage.findOneAndUpdate.mockResolvedValue({
      _id: imageId,
    } as any);

    const req = {
      user: { userId: userId.toString() },
      file: {
        buffer: Buffer.from('avatar'),
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: 1024,
      },
    };

    const res = createMockResponse();

    await uploadUserImage(req as any, res as any);

    expect(mockedUploadBufferToGridFS).toHaveBeenCalledWith(
      req.file.buffer,
      'avatar.png',
      'image/png',
      'images'
    );

    expect(mockedImage.findOneAndUpdate).toHaveBeenCalled();
    expect(mockedUser.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      image: imageId,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { imageId },
    });
  });

  it('uploadUserImage deletes old GridFS file when replacing image', async () => {
    const userId = new mongoose.Types.ObjectId();
    const oldFileId = new mongoose.Types.ObjectId();
    const newFileId = new mongoose.Types.ObjectId();
    const imageId = new mongoose.Types.ObjectId();

    mockedImage.findOne.mockResolvedValue({
      fileId: oldFileId,
    } as any);

    mockedUploadBufferToGridFS.mockResolvedValue(newFileId as any);
    mockedImage.findOneAndUpdate.mockResolvedValue({
      _id: imageId,
    } as any);

    const req = {
      user: { userId: userId.toString() },
      file: {
        buffer: Buffer.from('avatar'),
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: 1024,
      },
    };

    const res = createMockResponse();

    await uploadUserImage(req as any, res as any);

    expect(mockedDeleteGridFSFile).toHaveBeenCalledWith(oldFileId, 'images');
  });

  it('getUserImage throws BadRequestError for invalid user ID', async () => {
    const req = {
      params: { userId: 'invalid-id' },
    };

    const res = createMockResponse();

    await expect(getUserImage(req as any, res as any)).rejects.toBeInstanceOf(BadRequestError);
  });

  it('getUserImage throws NotFoundError when image does not exist', async () => {
    mockedImage.findOne.mockResolvedValue(null as any);

    const req = {
      params: { userId: new mongoose.Types.ObjectId().toString() },
    };

    const res = createMockResponse();

    await expect(getUserImage(req as any, res as any)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('getUserImage streams existing image and sets Content-Type', async () => {
    const fileId = new mongoose.Types.ObjectId();
    const pipe = vi.fn();

    mockedImage.findOne.mockResolvedValue({
      fileId,
      contentType: 'image/png',
    } as any);

    mockedOpenGridFSDownloadStream.mockReturnValue({
      pipe,
    } as any);

    const req = {
      params: { userId: new mongoose.Types.ObjectId().toString() },
    };

    const res = createMockResponse();

    await getUserImage(req as any, res as any);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(mockedOpenGridFSDownloadStream).toHaveBeenCalledWith(fileId, 'images');
    expect(pipe).toHaveBeenCalledWith(res);
  });

  it('deleteUserImage throws NotFoundError when image does not exist', async () => {
    mockedImage.findOne.mockResolvedValue(null as any);

    const req = {
      user: { userId: new mongoose.Types.ObjectId().toString() },
    };

    const res = createMockResponse();

    await expect(deleteUserImage(req as any, res as any)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deleteUserImage deletes GridFS file, Image record, and unsets user image', async () => {
    const userId = new mongoose.Types.ObjectId();
    const imageId = new mongoose.Types.ObjectId();
    const fileId = new mongoose.Types.ObjectId();

    mockedImage.findOne.mockResolvedValue({
      _id: imageId,
      fileId,
    } as any);

    const req = {
      user: { userId: userId.toString() },
    };

    const res = createMockResponse();

    await deleteUserImage(req as any, res as any);

    expect(mockedDeleteGridFSFile).toHaveBeenCalledWith(fileId, 'images');
    expect(mockedImage.deleteOne).toHaveBeenCalledWith({ _id: imageId });
    expect(mockedUser.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      $unset: { image: '' },
    });

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('getVisualizerImage throws BadRequestError for invalid visualizer ID', async () => {
    const req = {
      params: { visualizerId: 'invalid-id' },
    };

    const res = createMockResponse();

    await expect(getVisualizerImage(req as any, res as any)).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it('getVisualizerImage throws NotFoundError when image does not exist', async () => {
    mockedImage.findOne.mockResolvedValue(null as any);

    const req = {
      params: { visualizerId: new mongoose.Types.ObjectId().toString() },
    };

    const res = createMockResponse();

    await expect(getVisualizerImage(req as any, res as any)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('getVisualizerImage streams existing image and sets Content-Type', async () => {
    const fileId = new mongoose.Types.ObjectId();
    const pipe = vi.fn();

    mockedImage.findOne.mockResolvedValue({
      fileId,
      contentType: 'image/webp',
    } as any);

    mockedOpenGridFSDownloadStream.mockReturnValue({
      pipe,
    } as any);

    const req = {
      params: { visualizerId: new mongoose.Types.ObjectId().toString() },
    };

    const res = createMockResponse();

    await getVisualizerImage(req as any, res as any);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/webp');
    expect(mockedOpenGridFSDownloadStream).toHaveBeenCalledWith(fileId, 'images');
    expect(pipe).toHaveBeenCalledWith(res);
  });
});
