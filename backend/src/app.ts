import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRouter from './routes/auth';

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
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser(process.env.JWT_SECRET));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/v1/auth', authRouter);

// 404 + global error handler — must be last
app.use(notFound);
app.use(errorHandler);

export default app;
