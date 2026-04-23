import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/NotFoundError";

export const notFound = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new NotFoundError());
}
