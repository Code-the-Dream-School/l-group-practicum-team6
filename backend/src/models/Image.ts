import mongoose, { Schema, Document } from "mongoose";
export type ImageOwnerType = 'user' | 'visualizer';

export interface ImageType extends Document{
  ownerType: ImageOwnerType;
  ownerId: mongoose.Types.ObjectId;
  fileId: mongoose.Types.ObjectId;
  filename: string;
  contentType: string;
  size: number;
}

const ImageSchema = new mongoose.Schema<ImageType>(
  {
    ownerType: {
      type: String,
      enum: ['user', 'visualizer'],
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
}, { timestamps: true });

ImageSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true });

export default mongoose.model<ImageType>('Image', ImageSchema);
