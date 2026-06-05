import { Request, Response } from 'express'; // Answers to client
import { StatusCodes } from 'http-status-codes'; // Wrraped tool to show codes
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../errors';
import { clearAuthCookie } from '../utils/jwt';
import { API_ERROR_MESSAGES } from '../constants';
import { API_SUCCESS_MESSAGES } from '../constants';

import User from '../models/User';
import UserVisual from '../models/UserVisual';
import Visualizer from '../models/Visualizer';

// Adding user from authenticate middleware
interface AuthRequest extends Request {
  user?: { userId: string; name: string; email: string };
}

// Show current User
export const showCurrentUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId ?? '');

  if (!user) throw new NotFoundError(API_ERROR_MESSAGES.USER_NOT_FOUND);
  res.status(StatusCodes.OK).json({ data: user });
};

// Update User
export const updateUser = async (req: AuthRequest, res: Response) => {
  // Pull data from obj
  const { name, email } = req.body;

  // Validation
  if (!name && !email) throw new BadRequestError(API_ERROR_MESSAGES.PLEASE_PROVIDE_NAME_OR_EMAIL);

  // Check DB
  const user = await User.findById(req.user?.userId ?? '');

  // Working on result (checking, changes)
  if (!user) throw new NotFoundError(API_ERROR_MESSAGES.USER_NOT_FOUND);
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) throw new BadRequestError(API_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    user.email = email;
  }
  if (name) user.name = name;
  await user.save(); // Saving to DB
  // Answer
  res.status(StatusCodes.OK).json({ data: user });
};

// Update password
export const updateUserPassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Checking data
  if (!currentPassword || !newPassword) {
    throw new BadRequestError(API_ERROR_MESSAGES.PLEASE_PROVIDE_ALL_PASSWORD_FIELDS);
  }

  if (newPassword.length < 8) throw new BadRequestError(API_ERROR_MESSAGES.PASSWORD_MIN_LENGTH);

  // check if new password is the same as previus
  if (currentPassword === newPassword) {
    throw new BadRequestError(API_ERROR_MESSAGES.NEW_PASSWORD_MUST_DIFFER);
  }

  // Manipulation with DB
  const user = await User.findById(req.user?.userId ?? '').select('+password');
  if (!user) throw new NotFoundError(API_ERROR_MESSAGES.USER_NOT_FOUND);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new BadRequestError(API_ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);

  // Save
  user.password = newPassword;
  await user.save();

  // Respond
  res.status(StatusCodes.OK).json({ msg: API_SUCCESS_MESSAGES.PASSWORD_UPDATED });
};

// Delete User
export const deleteUser = async (req: AuthRequest, res: Response) => {
  // Get data
  const { password } = req.body;

  // Validate
  if (!password) throw new BadRequestError(API_ERROR_MESSAGES.PLEASE_PROVIDE_PASSWORD);

  // go to DB
  const user = await User.findById(req.user?.userId ?? '').select('+password');

  // Process and delete
  if (!user) throw new NotFoundError(API_ERROR_MESSAGES.USER_NOT_FOUND);
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new BadRequestError(API_ERROR_MESSAGES.INVALID_PASSWORD);

  // Cascade delete
  await UserVisual.deleteMany({ userId: user._id });

  await User.findByIdAndDelete(user._id);

  // Respond
  clearAuthCookie(res);
  res.status(StatusCodes.NO_CONTENT).send();
};

// Get Visuals
export const getUserVisuals = async (req: AuthRequest, res: Response) => {
  // Get data and Go to DB
  const visuals = await UserVisual.find({ userId: req.user?.userId ?? '' }).populate(
    'visualizerId'
  );

  // respond
  res.status(StatusCodes.OK).json({ data: visuals });
};

// Add visual collection
export const addVisualToCollection = async (req: AuthRequest, res: Response) => {
  // Get data from url and ensure it is a string
  const id = req.params.id as string;

  // Validate if id is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(API_ERROR_MESSAGES.INVALID_VISUALIZER_ID);
  }

  // Go to DB
  const visualizer = await Visualizer.findById(id);

  // Processing and go to DB
  if (!visualizer) throw new NotFoundError(API_ERROR_MESSAGES.VISUALIZER_NOT_FOUND);

  const alreadySaved = await UserVisual.findOne({
    userId: new mongoose.Types.ObjectId(req.user?.userId ?? ''),
    visualizerId: new mongoose.Types.ObjectId(id),
  });

  if (alreadySaved) throw new BadRequestError(API_ERROR_MESSAGES.VISUALIZER_ALREADY_IN_COLLECTION);

  const userVisual = await UserVisual.create({
    userId: new mongoose.Types.ObjectId(req.user?.userId ?? ''),
    visualizerId: new mongoose.Types.ObjectId(id),
  });

  // respond
  res.status(StatusCodes.CREATED).json({ data: userVisual });
};

// Remove visualiser from collection
export const removeVisualFromCollection = async (req: AuthRequest, res: Response) => {
  // Get data and ensure it is a string
  const id = req.params.id as string;

  // Validate if id is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(API_ERROR_MESSAGES.INVALID_VISUALIZER_ID);
  }

  // Go to DB , find and remove
  const userVisual = await UserVisual.findOneAndDelete({
    userId: new mongoose.Types.ObjectId(req.user?.userId ?? ''),
    visualizerId: new mongoose.Types.ObjectId(id),
  });

  // Process result
  if (!userVisual) throw new NotFoundError(API_ERROR_MESSAGES.VISUALIZER_NOT_FOUND_IN_COLLECTION);

  // Respond
  res.status(StatusCodes.OK).json({ msg: API_SUCCESS_MESSAGES.REMOVED_FROM_COLLECTION });
};
