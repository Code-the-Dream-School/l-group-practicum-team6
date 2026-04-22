import { Request as ExpressRequest, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors';

export interface UserPayload {
  userId: string;
  name: string;
  email: string;
}

/*
    Extends the standard Express Request to include the user object.
 */
interface AuthRequest extends ExpressRequest {
  user?: UserPayload;
}

/*
    Middleware to protect routes. 
    Checks for a signed token in cookies, verifies it,
    and attaches the user info to the request.
 */
export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Get the signed cookie
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError('Authentication Invalid');
  }

  // Saving JWT_SECRET into variable, removed '!'
  const secret = process.env.JWT_SECRET;
  // Check if secret is availble 
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    // 2. Verify the token
    const payload = jwt.verify(token, secret) as UserPayload;

    // 3. Attach user data to the request for use in controllers
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
