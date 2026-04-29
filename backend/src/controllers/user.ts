/*
    !!! Pls do not delete this comments, this is for me and 
    for you to remember what and why I am doing it.

    What we have to do,  when we get requests.

    Here will be logic. Updating, Deleting, getUser.

    What tools I will use:

    showCurrentUser _ will give User data
    updateUser _ update name/email
    updateUserPassword _ changing password and check old one
    deleteUser _ remove profile and all linked data
    getuserVisuals _ get list of collection visuals
    addVisualToCollection save it to collection
    removeVisualFromCollection _ remove form collection 
*/

import { Request, Response } from 'express'; // Answers to client
import { StatusCodes } from 'http-status-codes'; // Wrraped tool to show codes
import { BadRequestError, NotFoundError } from '../errors';

import User from '../models/User';
import UserVisual from '../models/UserVisual';
import Visualizer from '../models/Visualizer';

// Adding user from authenticate middleware
interface AuthRequest extends Request {
  user?: { userId: string; name: string; email: string };
}

// Show current User 
export const showCurrentUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);

  if (!user) throw new NotFoundError('User not found');
  res.status(StatusCodes.OK).json({ data: user });
};

// Update User 
export const updateUser = async (req: AuthRequest, res: Response) => {

  // Pull data from obj
  const { name, email } = req.body;

  // Validation
  if (!name && !email) throw new BadRequestError('Please provide name or email');

  // Check DB
  const user = await User.findById(req.user!.userId);

  // Working on result (checking, changes)
  if (!user) throw new NotFoundError('User not found');
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) throw new BadRequestError('Email already in use');
    user.email = email;
  }
  if (name) user.name = name;
  await user.save(); // Saving to DB
  // Answer
  res.status(StatusCodes.OK).json({ data: user });
};

// Update password
export const updateUserPassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new BadRequestError('Please provide all password fields');
  }

  const user = await User.findById(req.user!.userId).select('+password');
  if (!user) throw new NotFoundError('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new BadRequestError('Current password is incorrect');

  if (newPassword.length < 8) throw new BadRequestError('Password must be at least 8 characters');
  if (newPassword !== confirmNewPassword) throw new BadRequestError('Passwords do not match');

  user.password = newPassword;
  await user.save();

  // Respond
  res.cookie('token', 'logout', { httpOnly: true, expires: new Date(Date.now()) });
  res.status(StatusCodes.OK).json({ msg: 'Password updated' });
};

// Delete User
export const deleteUser = async (req: AuthRequest, res: Response) => {
  
  // Get data
  const { password } = req.body;

  // Validate
  if (!password) throw new BadRequestError('Please provide password');

  // go to DB
  const user = await User.findById(req.user!.userId).select('+password');

  // Process and delete
  if (!user) throw new NotFoundError('User not found');
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new BadRequestError('Invalid password');
  await UserVisual.deleteMany({ userId: user._id });
  await User.findByIdAndDelete(user._id);

  // Respond
  res.cookie('token', 'logout', { httpOnly: true, expires: new Date(Date.now()) });
  res.status(StatusCodes.NO_CONTENT).send();
};

// Get Visuals
export const getUserVisuals = async (req: AuthRequest, res: Response) => {
  
  // Get data and Go to DB
  const visuals = await UserVisual.find({ userId: req.user!.userId }).populate('visualizerId');
  
  // respond
  res.status(StatusCodes.OK).json({ data: visuals });
};

// Add visual collection
export const addVisualToCollection = async (req: AuthRequest, res: Response) => {
  
  // Get data from url
  const { id } = req.params;

  // Go to DB
  const visualizer = await Visualizer.findById(id);

  // Processing and go to DB
  if (!visualizer) throw new NotFoundError('Visualizer not found');
  const alreadySaved = await UserVisual.findOne({ userId: req.user!.userId, visualizerId: id });
  if (alreadySaved) throw new BadRequestError('Visualizer already in collection');
  const userVisual = await UserVisual.create({ userId: req.user!.userId, visualizerId: id });
  
  // respond
  res.status(StatusCodes.CREATED).json({ data: userVisual });
};

// Reomve visualiser from collection
export const removeVisualFromCollection = async (req: AuthRequest, res: Response) => {
  
  // Get data
  const { id } = req.params;

  // Go to DB , find and remove
  const userVisual = await UserVisual.findOneAndDelete({ userId: req.user!.userId, visualizerId: id });

  // Process result
  if (!userVisual) throw new NotFoundError('Visualizer not found in collection');

  // Respond
  res.status(StatusCodes.OK).json({ msg: 'Removed from collection' });
};
