import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';
import Visualizer from '../models/Visualizer';

// GET /api/v1/visualizers, public endpoint. 
export const getAllVisualizers = async (req: Request, res: Response) => {
  // Pagination defaults and max cap
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
  const skip  = (page - 1) * limit;

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
    total,                             // total matching documents across all pages
    page,                              // current page
    pages: Math.ceil(total / limit),   // total number of pages
  });
};


 // GET /api/v1/visualizers/demo
export const getDemoVisualizer = async (_req: Request, res: Response) => {
  // Returns the single visualizer as isDemo true
  const visualizer = await Visualizer.findOne({ isDemo: true });

  // Returns 404 when no demo visualizer exists in the DB
  if (!visualizer) throw new NotFoundError('No demo visualizer found');

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
  const visualizer = await Visualizer.findById(req.params.id);

  if (!visualizer) throw new NotFoundError('Visualizer not found');
// Returns the full visualizer 
  res.status(StatusCodes.OK).json({ data: visualizer });
};
