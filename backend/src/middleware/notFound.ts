import { Request, Response, NextFunction } from 'express';

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  const error = Object.assign(new Error('Route not found'), { statusCode: 404 });
  next(error);
};
