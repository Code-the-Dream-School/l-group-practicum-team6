import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError, BadRequestError } from '../errors';
import { attachCookiesToResponse } from '../utils/jwt';
import User from '../models/User';

// Register a new user 
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide name, email and password');
  }

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError('Email already exists');
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
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const token = user.createJWT();
  attachCookiesToResponse(res, token);

  res.status(StatusCodes.OK).json({ data: user });
};

// Logout user 
export const logout = async (req: Request, res: Response) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
    signed: true,
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};
