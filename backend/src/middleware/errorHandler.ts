import { NextFunction, Request, Response } from 'express';

interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode ?? 500;

  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 && isProduction ? 'Internal server error' : err.message,
    },
  });
};
