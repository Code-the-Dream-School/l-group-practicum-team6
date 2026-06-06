import mongoose from 'mongoose';
import { BadRequestError } from '../errors';

export function validateObjectId(id: string, errorMessage: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError(errorMessage);
  }
}
