import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import visualizerRouter from './routes/visualizer';
import imageRouter from './routes/images';

import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { API_ROUTES } from './constants';

const app = express();

app.use(express.json());
app.use(helmet());
// credentials: true required so browser sends auth cookie cross-origin.
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
// Secret enables signed cookies for JWT-bearing auth cookies.
app.use(cookieParser(process.env.JWT_SECRET));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get(API_ROUTES.HEALTH, (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes — register, login, logout
app.use(API_ROUTES.AUTH, authRouter);
// Profile management, visualiser collection
app.use(API_ROUTES.USERS, userRouter);
// Visualizer route
app.use(API_ROUTES.VISUALIZERS, visualizerRouter);
// Image routes - upload and retrieval
app.use(API_ROUTES.IMAGES, imageRouter);

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
