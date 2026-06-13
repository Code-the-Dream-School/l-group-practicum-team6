import mongoose from 'mongoose';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllVisualizers,
  getDemoVisualizer,
  getTags,
  getVisualizerById,
} from '../../src/controllers/visualizer';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Visualizer from '../../src/models/Visualizer';

vi.mock('../../src/models/Visualizer', () => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn(),
  };

  return {
    default: {
      find: vi.fn(() => mockQuery),
      countDocuments: vi.fn(),
      findOne: vi.fn(),
      distinct: vi.fn(),
      findById: vi.fn(),
    },
  };
});

const mockedVisualizer = vi.mocked(Visualizer);

describe('Visualizer Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      query: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('getAllVisualizers', () => {
    it('should return all visualizers with default pagination', async () => {
      const mockItems = [{ name: 'V1' }, { name: 'V2' }];
      const mockTotal = 2;

      const mockQuery = mockedVisualizer.find(vi.fn() as any);
      (mockQuery.limit as any).mockResolvedValue(mockItems);
      mockedVisualizer.countDocuments.mockResolvedValue(mockTotal as any);

      await getAllVisualizers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        data: mockItems,
        total: mockTotal,
        page: 1,
        pages: 1,
      });
    });

    it('should apply search and tag filters', async () => {
      req.query = { search: 'test', tag: 'blue' };
      const mockQuery = mockedVisualizer.find(vi.fn() as any);
      (mockQuery.limit as any).mockResolvedValue([]);
      mockedVisualizer.countDocuments.mockResolvedValue(0 as any);

      await getAllVisualizers(req as Request, res as Response);

      expect(mockedVisualizer.find).toHaveBeenCalledWith({
        name: { $regex: 'test', $options: 'i' },
        tags: 'blue',
      });
    });
  });

  describe('getDemoVisualizer', () => {
    it('should return demo visualizer if found', async () => {
      const mockDemo = { name: 'Demo', isDemo: true };
      mockedVisualizer.findOne.mockResolvedValue(mockDemo as any);

      await getDemoVisualizer(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ data: mockDemo });
    });

    it('should throw NotFoundError if no demo found', async () => {
      mockedVisualizer.findOne.mockResolvedValue(null);

      await expect(getDemoVisualizer(req as Request, res as Response)).rejects.toThrow(
        'No demo visualizer found'
      );
    });
  });

  describe('getTags', () => {
    it('should return sorted unique tags', async () => {
      const mockTags = ['b', 'a', 'c'];
      mockedVisualizer.distinct.mockResolvedValue(mockTags as any);

      await getTags(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ data: ['a', 'b', 'c'] });
    });
  });

  describe('getVisualizerById', () => {
    it('should return visualizer if found by id', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const mockVisualizer = { _id: id, name: 'V1' };
      req.params = { id };
      mockedVisualizer.findById.mockResolvedValue(mockVisualizer as any);

      await getVisualizerById(req as Request, res as Response);

      expect(mockedVisualizer.findById).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ data: mockVisualizer });
    });

    it('should throw NotFoundError if visualizer not found by id', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      req.params = { id };
      mockedVisualizer.findById.mockResolvedValue(null);

      await expect(getVisualizerById(req as Request, res as Response)).rejects.toThrow(
        'Visualizer not found'
      );
    });
  });
});
