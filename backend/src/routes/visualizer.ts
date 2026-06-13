import { Router } from 'express';
import { authenticateUser } from '../middleware/authentication';
import {
  getAllVisualizers,
  getDemoVisualizer,
  getTags,
  getVisualizerById,
} from '../controllers/visualizer';

const router = Router();

// No auth required, public (list, demo, tags), mounted at /api/v1/visualizers
router.get('/', getAllVisualizers); // Get
router.get('/demo', getDemoVisualizer); // Get demo
router.get('/tags', getTags); // Get tags

// Auth required, single item route
router.get('/:id', authenticateUser, getVisualizerById); // Get full

export default router;
