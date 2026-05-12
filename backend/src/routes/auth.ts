import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout } from '../controllers/auth';

const router = Router();

// Limits, 20 req per 15 min for one IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;
