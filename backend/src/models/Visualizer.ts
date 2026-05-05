
// Mongoose library to work with DB
import mongoose, { Schema, Document} from 'mongoose';

// Describing structure of data 
export interface IVisualizer extends Document {
    name: string;
    imageUrl: string; // Link to preview
    }

// Creating Model schema Visualizer
const VisualizerSchema = new Schema<IVisualizer>({
    name: { // Attribute
        type: String,
        required: true,
        // Do we need min, max?
    },
    imageUrl: { // Attribute
        type: String,
        required: true, 
    },
}, { timestamps: true}) // auto adding Date, when created and updated

// Exporting and Creating model by mongoose
export default mongoose.model<IVisualizer>('Visualizer', VisualizerSchema)