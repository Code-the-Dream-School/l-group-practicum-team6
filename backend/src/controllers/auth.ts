import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError, BadRequestError } from '../errors';
import { attachCookiesToResponse, clearAuthCookie } from '../utils/jwt';
import User from '../models/User';
import { API_ERROR_MESSAGES } from '../constants';
import { API_SUCCESS_MESSAGES } from '../constants';

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError(API_ERROR_MESSAGES.PLEASE_PROVIDE_NAME_EMAIL_PASSWORD);
  }

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError(API_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  const user = await User.create({ name, email, password });
  const token = user.createJWT();
  attachCookiesToResponse(res, token);

  res.status(StatusCodes.CREATED).json({ data: user });
};

// Login user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError(API_ERROR_MESSAGES.PLEASE_PROVIDE_EMAIL_PASSWORD);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError(API_ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError(API_ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const token = user.createJWT();
  attachCookiesToResponse(res, token);

  res.status(StatusCodes.OK).json({ data: user });
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(StatusCodes.OK).json({ msg: API_SUCCESS_MESSAGES.USER_LOGGED_OUT });
};
