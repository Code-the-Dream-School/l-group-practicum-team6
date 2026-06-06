import { Router } from 'express';
import { authenticateAdmin, authenticateUser } from '../middleware/authentication';
import { uploadImage } from '../middleware/uploadImage';
import {
  uploadUserImage,
  getUserImage,
  deleteUserImage,
  uploadVisualizerImage,
  getVisualizerImage,
} from '../controllers/images';

const router = Router();

router.post('/users/current', authenticateUser, uploadImage.single('image'), uploadUserImage);

router.get('/users/:userId', getUserImage);

router.delete('/users/current', authenticateUser, deleteUserImage);

router.post(
  '/visualizers/:visualizerId',
  authenticateAdmin,
  uploadImage.single('image'),
  uploadVisualizerImage
);
router.get('/visualizers/:visualizerId', getVisualizerImage);

export default router;
