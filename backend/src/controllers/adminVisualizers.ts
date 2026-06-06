import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';

import type { GenerateVisualizerRequest } from '@sonix/shared';
import { BadRequestError, NotFoundError } from '../errors';
import Image from '../models/Image';
import UserVisual from '../models/UserVisual';
import Visualizer from '../models/Visualizer';
import { deleteImage } from '../services/imageStorage';
import { generateShader } from '../services/generator';

export const generateVisualizer = async (req: Request, res: Response) => {
  const body = req.body as GenerateVisualizerRequest;
  const userPrompt = body.contents?.[0]?.parts?.[0]?.text;
  const systemPrompt = body.systemInstruction?.parts?.[0]?.text;

  if (!userPrompt) {
    throw new BadRequestError('Please provide a prompt');
  }
  if (!systemPrompt) {
    throw new BadRequestError('Please provide a system prompt');
  }

  const glsl = await generateShader(body);

  const visualizer = await Visualizer.create({
    name: `AI Generated - ${new Date().toISOString()}`,
    glsl,
    isDemo: false,
  });
  res.status(StatusCodes.CREATED).json({ data: visualizer });
};

export const createVisualizer = async (req: Request, res: Response) => {
  const { name, source, imageUrl, glsl, isDemo, tags } = req.body;

  if (!glsl) {
    throw new BadRequestError('Please provide glsl');
  }

  if (!name) {
    throw new BadRequestError('Please provide name');
  }

  const visualizer = await Visualizer.create({
    name,
    source,
    imageUrl,
    glsl,
    isDemo,
    tags,
  });

  res.status(StatusCodes.CREATED).json({ data: visualizer });
};

export const updateVisualizer = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid visualizer ID');
  }

  const visualizer = await Visualizer.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!visualizer) {
    throw new NotFoundError('Visualizer not found');
  }

  res.status(StatusCodes.OK).json({ data: visualizer });
};

export const deleteVisualizer = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid visualizer ID');
  }

  const visualizer = await Visualizer.findById(id);

  if (!visualizer) {
    throw new NotFoundError('Visualizer not found');
  }

  const visualizerId = visualizer._id as mongoose.Types.ObjectId;

  await UserVisual.deleteMany({ visualizerId });

  const imageQuery: Array<Record<string, unknown>> = [
    { ownerType: 'visualizer', ownerId: visualizerId },
  ];
  if (visualizer.imageUrl) {
    imageQuery.push({ _id: visualizer.imageUrl });
  }

  const associatedImages = await Image.find({
    $or: imageQuery,
  });

  if (associatedImages.length > 0) {
    for (const image of associatedImages) {
      await deleteImage(image.fileId);
    }

    await Image.deleteMany({
      _id: {
        $in: associatedImages.map((image) => image._id),
      },
    });
  }

  await Visualizer.findByIdAndDelete(id);

  res.status(StatusCodes.NO_CONTENT).send();
};
