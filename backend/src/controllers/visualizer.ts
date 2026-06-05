import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import Visualizer from '../models/Visualizer';
import { API_ERROR_MESSAGES, VISUALIZER_PAGINATION } from '../constants';
import { validateObjectId } from '../utils/objectIdValidation';

// GET /api/v1/visualizers, public endpoint.
export const getAllVisualizers = async (req: Request, res: Response) => {
  // Pagination defaults and max cap
  const page = Math.max(
    VISUALIZER_PAGINATION.DEFAULT_PAGE,
    parseInt(req.query.page as string) || VISUALIZER_PAGINATION.DEFAULT_PAGE
  );
  const limit = Math.min(
    VISUALIZER_PAGINATION.MAX_LIMIT,
    Math.max(
      VISUALIZER_PAGINATION.MIN_LIMIT,
      parseInt(req.query.limit as string) || VISUALIZER_PAGINATION.DEFAULT_LIMIT
    )
  );
  const skip = (page - 1) * limit;

  // Dynamic Mongo filter
  const filter: Record<string, unknown> = {};

  if (req.query.search) {
    // Match on visualizer name
    filter.name = { $regex: req.query.search as string, $options: 'i' };
  }

  if (req.query.tag) {
    // Matches documents where `tags` array contains the given value
    filter.tags = req.query.tag as string;
  }

  // Run the page query and the total count in parallel for better performance
  const [items, total] = await Promise.all([
    Visualizer.find(filter)
      .select('_id name imageUrl isDemo tags') // exclude heavy `glsl` field
      .skip(skip)
      .limit(limit),
    Visualizer.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    data: items,
    total, // total matching documents across all pages
    page, // current page
    pages: Math.ceil(total / limit), // total number of pages
  });
};

// GET /api/v1/visualizers/demo
export const getDemoVisualizer = async (_req: Request, res: Response) => {
  // Returns the single visualizer as isDemo true
  const visualizer = await Visualizer.findOne({ isDemo: true });

  // Returns 404 when no demo visualizer exists in the DB
  if (!visualizer) throw new NotFoundError(API_ERROR_MESSAGES.NO_DEMO_VISUALIZER_FOUND);

  res.status(StatusCodes.OK).json({ data: visualizer });
};

// GET /api/v1/visualizers/tags
export const getTags = async (_req: Request, res: Response) => {
  // Collects unique values from the tags array field across all docs
  const tags = await Visualizer.distinct('tags');

  res.status(StatusCodes.OK).json({ data: tags.sort() });
};

// GET /api/v1/visualizers/:id, protected endpoint, requires the authenticate middleware on the route.
export const getVisualizerById = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    throw new BadRequestError(API_ERROR_MESSAGES.INVALID_VISUALIZER_ID);
  }

  validateObjectId(id, API_ERROR_MESSAGES.INVALID_VISUALIZER_ID);

  const visualizer = await Visualizer.findById(req.params.id);

  if (!visualizer) throw new NotFoundError(API_ERROR_MESSAGES.VISUALIZER_NOT_FOUND);
  // Returns the full visualizer
  res.status(StatusCodes.OK).json({ data: visualizer });
};
