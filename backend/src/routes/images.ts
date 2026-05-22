import { Router } from 'express';
import { authenticateUser } from '../middleware/authentication';
import { uploadImage } from '../middleware/uploadImage';
import {
  uploadUserImage,
  getUserImage,
  deleteUserImage,
  getVisualizerImage,
} from '../controllers/images';

const router = Router();

router.post('/users/user', authenticateUser, uploadImage.single('image'), uploadUserImage);

router.get('/users/:userId', getUserImage);

router.delete('/users/user', authenticateUser, deleteUserImage);

router.get('/visualizers/:visualizerId', getVisualizerImage);

export default router;
