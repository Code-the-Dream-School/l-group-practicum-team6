/*
    Conceptual for this Model is connection between User and Visualizer

    endpoints GET, POST, DELETE /user/visuals

    Here I will I will use keyword from ticket 'populated with VisualizerListItem' 
    where UserVisual will save ref to Visualizer. With userId + visualizeId.

    Pattern will answer to questions, who saves? (User), What?(Visualizer),
    UserVisual will connect both ID (userId and visualizerId)

    Tools, ref will tell Mongoose where to populate from

    Declare UserVisual, where following attributes: userId, visualizerId
*/

import mongoose, {Schema, Document} from 'mongoose';

export interface IUserVisual extends Document {
    userId: mongoose.Types.ObjectId; // ref 
    visualizerId: mongoose.Types.ObjectId; // ref to Visualizer
}

// 
const UserVisualSchema = new Schema<IUserVisual>({
  userId: {
    type: Schema.Types.ObjectId, // MongoDB id type
    ref: 'User',                 // tells populate() where to look
    required: true,
  },
  visualizerId: {
    type: Schema.Types.ObjectId, 
    ref: 'Visualizer',           
    required: true,
  },
}, { timestamps: true });

// 400 if already saved, where mongoDB will take care of duplicates
UserVisualSchema.index({ 
    userId: 1, visualizerId: 1 }, // Pair who and what
    { unique: true }); 

// Exporting and Creating model by mongoose
export default mongoose.model<IUserVisual>('UserVisual', UserVisualSchema);