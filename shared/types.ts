export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  image?: string;
}

export interface Visualizer {
  _id: string;
  name: string;
  source: string;
  glsl: string;
  image?: string;
  isDemo: boolean;
}

export interface VisualizerListItem {
  _id: string;
  name: string;
  image: string;
  isDemo: boolean;
}

export interface UserVisual {
  _id: string;
  userId: string;
  visualizerId: string;
  savedAt: string;
}

export type ApiResponse<T> = { data: T };

export interface ApiError {
  error: {
    message: string;
  };
}
