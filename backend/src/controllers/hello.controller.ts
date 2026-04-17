import type { Request, Response } from 'express';

export const getHello = (_req: Request, res: Response): void => {
  res.json({
    message: 'Hello World'
  });
};
