import * as jwt from 'jsonwebtoken';
import { Response } from 'express';

/*
  Generates a JWT token using the provided payload.
  Signs it with JWT_SECRET and sets expiration from JWT_LIFETIME.
 */
export const createJWT = (payload: string | Buffer | object): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_LIFETIME as any) || '7d',
  });
};

/*
  Attaches the JWT token to an HTTP only cookie.
  This keeps the token secure in the browser and prevents script access.
 */
export const attachCookiesToResponse = (res: Response, token: string) => {
  const sevenDays = 1000 * 60 * 60 * 24 * 7; // 7 days in ms

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + sevenDays),
    secure: process.env.NODE_ENV === 'production',
    signed: true, 
    sameSite: 'strict',
  });
};
