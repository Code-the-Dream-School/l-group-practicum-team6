import { NextFunction, Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout } from '../controllers/auth';
import { TooManyRequestsError } from '../errors';
import { RATE_LIMIT } from '../constants';

const router = Router();

// Limits, 20 req per 15 min for one IP in prod, 1000 in dev
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max:
    process.env.NODE_ENV === 'production'
      ? RATE_LIMIT.AUTH_MAX_PRODUCTION
      : RATE_LIMIT.AUTH_MAX_NON_PRODUCTION,
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(new TooManyRequestsError(RATE_LIMIT.AUTH_MESSAGE));
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;
