import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import Image from '../models/Image';
import User from '../models/User';
import type { AuthRequest } from '../middleware/authentication';
import { BadRequestError, NotFoundError } from '../errors';
import { uploadBufferToGridFS, deleteGridFSFile, openGridFSDownloadStream } from '../utils/gridfs';
import { API_ERROR_MESSAGES, GRIDFS_BUCKETS, IMAGE_OWNER_TYPES } from '../constants';

export async function uploadUserImage(req: AuthRequest, res: Response) {
  if (!req.file) {
    throw new BadRequestError(API_ERROR_MESSAGES.PLEASE_PROVIDE_IMAGE);
  }

  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const existingImage = await Image.findOne({
    ownerType: IMAGE_OWNER_TYPES.USER,
    ownerId: userId,
  });

  const newFileId = await uploadBufferToGridFS(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    GRIDFS_BUCKETS.IMAGES
  );

  if (existingImage) {
    await deleteGridFSFile(existingImage.fileId, GRIDFS_BUCKETS.IMAGES);
  }

  const imageRecord = await Image.findOneAndUpdate(
    {
      ownerType: IMAGE_OWNER_TYPES.USER,
      ownerId: userId,
    },
    {
      ownerType: IMAGE_OWNER_TYPES.USER,
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
    throw new BadRequestError(API_ERROR_MESSAGES.INVALID_USER_ID);
  }

  const ownerId = new mongoose.Types.ObjectId(String(req.params.userId));
  const image = await Image.findOne({
    ownerType: IMAGE_OWNER_TYPES.USER,
    ownerId,
  });

  if (!image) {
    throw new NotFoundError(API_ERROR_MESSAGES.IMAGE_NOT_FOUND);
  }

  res.setHeader('Content-Type', image.contentType);

  const downloadStream = openGridFSDownloadStream(image.fileId, GRIDFS_BUCKETS.IMAGES);
  downloadStream.pipe(res);
}

export async function deleteUserImage(req: AuthRequest, res: Response) {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const image = await Image.findOne({
    ownerType: IMAGE_OWNER_TYPES.USER,
    ownerId: userId,
  });

  if (!image) {
    throw new NotFoundError(API_ERROR_MESSAGES.IMAGE_NOT_FOUND);
  }

  await deleteGridFSFile(image.fileId, GRIDFS_BUCKETS.IMAGES);
  await Image.deleteOne({ _id: image._id });
  await User.findByIdAndUpdate(userId, { $unset: { image: '' } });

  res.status(StatusCodes.NO_CONTENT).send();
}

export async function getVisualizerImage(req: Request, res: Response) {
  if (!mongoose.Types.ObjectId.isValid(String(req.params.visualizerId))) {
    throw new BadRequestError(API_ERROR_MESSAGES.INVALID_VISUALIZER_ID);
  }
  const image = await Image.findOne({
    ownerType: IMAGE_OWNER_TYPES.VISUALIZER,
    ownerId: new mongoose.Types.ObjectId(String(req.params.visualizerId)),
  });

  if (!image) {
    throw new NotFoundError(API_ERROR_MESSAGES.IMAGE_NOT_FOUND);
  }

  res.setHeader('Content-Type', image.contentType);

  const downloadStream = openGridFSDownloadStream(image.fileId, GRIDFS_BUCKETS.IMAGES);
  downloadStream.pipe(res);
}
