import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authentication';
import {
  createVisualizer,
  deleteVisualizer,
  updateVisualizer,
} from '../controllers/adminVisualizers';

const router = Router();

router.post('/', authenticateAdmin, createVisualizer);
router.patch('/:id', authenticateAdmin, updateVisualizer);
router.delete('/:id', authenticateAdmin, deleteVisualizer);

export default router;
