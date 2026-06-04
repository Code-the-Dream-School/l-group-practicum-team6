import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout } from '../controllers/auth';

const router = Router();

// Limits, 50 req per 1 min for one IP in prod, 1000 in dev
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 1000,
  message: {
    message: 'Too many requests from this IP, please try again after 1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;
