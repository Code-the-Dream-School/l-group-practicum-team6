import { Request as ExpressRequest, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors';

export interface UserPayload {
  userId: string;
  name: string;
  email: string;
}

interface AuthRequest extends ExpressRequest {
  user?: UserPayload;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError('Authentication Invalid');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const payload = jwt.verify(token, secret) as UserPayload;

    req.user = {
      userId: payload.userId,
      name: payload.name,
      email: payload.email
    };

    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication Invalid');
  }
};
