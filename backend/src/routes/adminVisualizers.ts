import { Router } from 'express';
import { adminOnly, authenticateUser } from '../middleware/authentication';
import {
  createVisualizer,
  deleteVisualizer,
  updateVisualizer,
} from '../controllers/adminVisualizers';

const router = Router();

router.use(authenticateUser, adminOnly);

router.post('/', createVisualizer);
router.patch('/:id', updateVisualizer);
router.delete('/:id', deleteVisualizer);

export default router;
