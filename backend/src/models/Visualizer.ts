/*
    Сonceptual understanding, how I can understand task for this block and model

    User visualizers managment

    endpoints: GET, PATCH, DELETE, POST for /user/visuals
    
    keywords: 'Populated', 'VisualizerListItem', '404 if visualizer doesn't exist'
    pattern: User (who), Visualizer(what), UserVisual(connection who+what)
    tool: in mongoDB from backend course we know we can use mongoose schema

    What I will do:

    Declare Visualizer
    name: string 
    image_Url: string
    timestamps: true
*/

import mongoose, { Schema, Document} from 'mongoose';

// Describing structure of data for ts
export interface IVisualizer extends Document {
    name: string;
    imageUrl: string;
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