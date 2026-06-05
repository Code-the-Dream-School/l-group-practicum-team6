import { Request as ExpressRequest, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors';
import { API_ERROR_MESSAGES } from '@sonix/shared';
import { AUTH_CONSTANTS } from '../constants';

export interface UserPayload {
  userId: string;
  name: string;
  email: string;
}

export interface AuthRequest extends ExpressRequest {
  user?: UserPayload;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.signedCookies[AUTH_CONSTANTS.COOKIE_NAME];

  if (!token) {
    throw new UnauthenticatedError(API_ERROR_MESSAGES.AUTHENTICATION_INVALID);
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
      email: payload.email,
    };

    next();
  } catch {
    throw new UnauthenticatedError(API_ERROR_MESSAGES.AUTHENTICATION_INVALID);
  }
};
