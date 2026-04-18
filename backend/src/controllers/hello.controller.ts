import type { Request, Response } from "express";
import type { ApiResponse } from "@sonix/shared";

export const getHello = (_req: Request, res: Response): void => {
  const payload: ApiResponse<{ message: string }> = {
    data: { message: "Hello World" },
  };
  res.json(payload);
};
