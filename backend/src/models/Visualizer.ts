import mongoose, { Schema, Document } from 'mongoose';

export interface IVisualizer extends Document {
  name: string;
  source: string;
  glsl: string;
  imageUrl?: mongoose.Types.ObjectId;
  isDemo: boolean;
  tags: string[];
}

const VisualizerSchema = new Schema<IVisualizer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
    },

    glsl: {
      type: String,
      required: true,
    },

    imageUrl: {
      // 51
      type: Schema.Types.ObjectId,
      ref: 'Image',
    },

    isDemo: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVisualizer>('Visualizer', VisualizerSchema);
