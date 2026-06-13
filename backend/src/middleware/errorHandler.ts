import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from '../errors/CustomAPIError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Expected operational errors (auth failures, 404s, validation) are part of
  // normal request flow — log a concise line, not a full stack, so the output
  // stays readable (e.g. during e2e runs that exercise logged-out paths).
  if (err instanceof CustomAPIError) {
    console.warn(`${err.name} (${err.statusCode}): ${err.message}`);
  } else {
    // Unexpected errors: log full details in development, essentials in prod.
    console.error(`Error:`, {
      name: err.name,
      message: err.message,
      stack: isProduction ? undefined : err.stack,
    });
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    }

    res.status(StatusCodes.BAD_REQUEST).json({
      error: {
        message,
      },
    });
    return;
  }

  // Known errors
  if (err instanceof CustomAPIError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
      },
    });
    return;
  }

  // Unknown errors - 500
  res.status(500).json({
    error: {
      message: isProduction ? 'Internal server error' : err.message,
    },
  });
};
