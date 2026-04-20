import { NextFunction, Request, Response } from 'express';
import { CustomAPIError } from '../errors/CustomAPIError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log full error details in development, but only essential info in production
  console.error(`Error:`, {
    name: err.name,
    message: err.message,
    stack: isProduction ? undefined : err.stack
  });

  // Known errors
  if (err instanceof CustomAPIError) {
    res.status(err.statusCode).json({ 
      error: { 
        message: err.message 
      } 
    });
    return;
  }

  // Unknown errors - 500
  res.status(500).json({ 
    error: { 
      message: isProduction 
        ? 'Internal server error' 
        : err.message 
    } 
  });
}