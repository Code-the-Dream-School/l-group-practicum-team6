import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import Image from '../models/Image';
import User from '../models/User';
import type { AuthRequest } from '../middleware/authentication';
import { BadRequestError, NotFoundError } from '../errors';
import { uploadBufferToGridFS, deleteGridFSFile, openGridFSDownloadStream } from '../utils/gridfs';

export async function uploadUserImage(req: AuthRequest, res: Response) {
  if (!req.file) {
    throw new BadRequestError('Please provide an image');
  }

  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const existingImage = await Image.findOne({
    ownerType: 'user',
    ownerId: userId,
  });

  const newFileId = await uploadBufferToGridFS(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    'images'
  );

  if (existingImage) {
    await deleteGridFSFile(existingImage.fileId, 'images');
  }

  const imageRecord = await Image.findOneAndUpdate(
    {
      ownerType: 'user',
      ownerId: userId,
    },
    {
      ownerType: 'user',
      ownerId: userId,
      fileId: newFileId,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  await User.findByIdAndUpdate(userId, { image: imageRecord._id });

  res.status(StatusCodes.OK).json({
    data: { imageId: imageRecord._id },
  });
}

export async function getUserImage(req: Request, res: Response) {
  if (!mongoose.Types.ObjectId.isValid(String(req.params.userId))) {
    throw new BadRequestError('Invalid user ID');
  }

  const ownerId = new mongoose.Types.ObjectId(String(req.params.userId));
  const image = await Image.findOne({
    ownerType: 'user',
    ownerId,
  });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  res.setHeader('Content-Type', image.contentType);

  const downloadStream = openGridFSDownloadStream(image.fileId, 'images');
  downloadStream.pipe(res);
}

export async function deleteUserImage(req: AuthRequest, res: Response) {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const image = await Image.findOne({
    ownerType: 'user',
    ownerId: userId,
  });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  await deleteGridFSFile(image.fileId, 'images');
  await Image.deleteOne({ _id: image._id });
  await User.findByIdAndUpdate(userId, { $unset: { image: '' } });

  res.status(StatusCodes.NO_CONTENT).send();
}

export async function getVisualizerImage(req: Request, res: Response) {
  if (!mongoose.Types.ObjectId.isValid(String(req.params.visualizerId))) {
    throw new BadRequestError('Invalid visualizer ID');
  }
  const image = await Image.findOne({
    ownerType: 'visualizer',
    ownerId: new mongoose.Types.ObjectId(String(req.params.visualizerId)),
  });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  res.setHeader('Content-Type', image.contentType);

  const downloadStream = openGridFSDownloadStream(image.fileId, 'images');
  downloadStream.pipe(res);
}
