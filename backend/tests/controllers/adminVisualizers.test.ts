import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/Visualizer', () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock('../../src/models/UserVisual', () => ({
  default: {
    deleteMany: vi.fn(),
  },
}));

vi.mock('../../src/models/Image', () => ({
  default: {
    find: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('../../src/services/imageStorage', () => ({
  deleteImage: vi.fn(),
}));

import { createVisualizer, deleteVisualizer } from '../../src/controllers/adminVisualizers';
import Image from '../../src/models/Image';
import UserVisual from '../../src/models/UserVisual';
import Visualizer from '../../src/models/Visualizer';
import { deleteImage } from '../../src/services/imageStorage';

const mockedVisualizer = vi.mocked(Visualizer);
const mockedUserVisual = vi.mocked(UserVisual);
const mockedImage = vi.mocked(Image);
const mockedDeleteImage = vi.mocked(deleteImage);

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
  } as unknown as Response;
}

describe('Admin visualizer controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws 400 when creating visualizer without glsl', async () => {
    const req = {
      body: {
        name: 'Missing Shader',
        source: 'admin',
      },
    } as Request;
    const res = makeRes();

    await expect(createVisualizer(req, res)).rejects.toThrow('Please provide glsl');
    expect(mockedVisualizer.create).not.toHaveBeenCalled();
  });

  it('deletes visualizer and cascades related records', async () => {
    const visualizerId = new mongoose.Types.ObjectId();
    const imageId = new mongoose.Types.ObjectId();

    const req = {
      params: {
        id: visualizerId.toString(),
      },
    } as unknown as Request;
    const res = makeRes();

    mockedVisualizer.findById.mockResolvedValue({
      _id: visualizerId,
      imageUrl: imageId,
    } as any);

    mockedImage.find.mockResolvedValue([
      {
        _id: imageId,
        fileId: new mongoose.Types.ObjectId(),
      },
    ] as any);

    await deleteVisualizer(req, res);

    expect(mockedUserVisual.deleteMany).toHaveBeenCalledWith({ visualizerId });
    expect(mockedDeleteImage).toHaveBeenCalledTimes(1);
    expect(mockedImage.deleteMany).toHaveBeenCalledWith({
      _id: {
        $in: [imageId],
      },
    });
    expect(mockedVisualizer.findByIdAndDelete).toHaveBeenCalledWith(visualizerId.toString());
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
