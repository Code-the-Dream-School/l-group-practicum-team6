import mongoose, { Schema, Document } from 'mongoose';                                             
                                                                                                     
  export interface IVisualizer extends Document {                                                    
      name: string; // from 51
      source: string;
      glsl: string;                                                                                  
      imageUrl?: mongoose.Types.ObjectId;   // changed, from 51
      isDemo: boolean;
      tags: string[];                                                                        
  }                                                                                                  
                                                                                                     
  const VisualizerSchema = new Schema<IVisualizer>({                                                 
      name: { 
        type: String, 
        required: true,
        trim: true, // 46
    },

      source: { // 46
          type: String,
      },

      glsl: { // 46
        type: String,
        required: true,
    },

      imageUrl: { // 51
        type: Schema.Types.ObjectId,
        ref: 'Image',
    },

      isDemo: { // 46
          type: Boolean,
          default: false,
      },
    
      tags: { // 46
          type: [String],
          default: [],
      },

                                                      
  }, { timestamps: true });  // 51                                                                        
                                                                                                     
  export default mongoose.model<IVisualizer>('Visualizer', VisualizerSchema);