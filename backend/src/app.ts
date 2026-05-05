import path from 'path';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRouter from './routes/auth';
import userRouter from './routes/user';

import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(helmet());
// credentials: true required so browser sends auth cookie cross-origin.
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
// Secret enables signed cookies for JWT-bearing auth cookies.
app.use(cookieParser(process.env.JWT_SECRET));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes — register, login, logout
app.use('/api/v1/auth', authRouter);
// Profile management, visualiser collection
app.use('/api/v1/users', userRouter);

// Serve built SPA: static assets first, then send index.html for any
// non-/api GET so client-side routes (e.g. /login) resolve on refresh.
const clientDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(clientDist));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

export default app;

