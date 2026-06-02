import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { AUTH_CONSTANTS } from '../constants';

/*
  Generates a JWT token using the provided payload.
  Signs it with JWT_SECRET and sets expiration from JWT_LIFETIME.
 */
export const createJWT = (payload: string | Buffer | object): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const expiresIn = (process.env.JWT_LIFETIME ||
    AUTH_CONSTANTS.JWT_DEFAULT_LIFETIME) as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

/*
  Attaches the JWT token to an HTTP only cookie.
  This keeps the token secure in the browser and prevents script access.
 */
export const attachCookiesToResponse = (res: Response, token: string) => {
  res.cookie(AUTH_CONSTANTS.COOKIE_NAME, token, {
    httpOnly: true,
    expires: new Date(Date.now() + AUTH_CONSTANTS.COOKIE_TTL_MS),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: AUTH_CONSTANTS.COOKIE_SAME_SITE,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.cookie(AUTH_CONSTANTS.COOKIE_NAME, AUTH_CONSTANTS.COOKIE_LOGOUT_VALUE, {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: AUTH_CONSTANTS.COOKIE_SAME_SITE,
  });
};
