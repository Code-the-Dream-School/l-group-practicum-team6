import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError, BadRequestError } from '../errors';
import { createJWT, attachCookiesToResponse } from '../utils/jwt';

//  model User, when it done
// import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide name, email and password');
  }

  // Temp obj 
  const user = { _id: 'temp_id', name, email }; 
  const tokenUser = { userId: user._id, name: user.name, email: user.email };
  
  const token = createJWT(tokenUser);
  attachCookiesToResponse(res, token);

  res.status(StatusCodes.CREATED).json({ data: user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  // Temp obj for test
  const user = { _id: 'temp_id', name: 'test user', email };
  const tokenUser = { userId: user._id, name: user.name, email: user.email };
  
  const token = createJWT(tokenUser);
  attachCookiesToResponse(res, token);

  res.status(StatusCodes.OK).json({ data: user });
};

export const logout = async (req: Request, res: Response) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};
