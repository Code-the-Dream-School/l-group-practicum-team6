import { Request as ExpressRequest, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ForbiddenError, UnauthenticatedError } from '../errors';
import { API_ERROR_MESSAGES, AUTH_CONSTANTS } from '../constants';
import User from '../models/User';

export interface UserPayload {
  userId: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthRequest extends ExpressRequest {
  user?: UserPayload;
}

const verifyToken = (req: AuthRequest): UserPayload => {
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
    if (!payload.userId || !payload.name || !payload.email) {
      throw new UnauthenticatedError(API_ERROR_MESSAGES.AUTHENTICATION_INVALID);
    }
    return payload;
  } catch {
    throw new UnauthenticatedError(API_ERROR_MESSAGES.AUTHENTICATION_INVALID);
  }
};

export const authenticateUser = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const payload = verifyToken(req);

  req.user = {
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    isAdmin: payload.isAdmin ?? false,
  };

  next();
};

export const authenticateAdmin = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const payload = verifyToken(req);

  const dbUser = await User.findById(payload.userId).select('isAdmin').lean<{ isAdmin: boolean }>();
  if (!dbUser?.isAdmin) {
    throw new ForbiddenError(API_ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED);
  }
  next();
};
