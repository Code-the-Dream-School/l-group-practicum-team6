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
  imageUrl?: string;
  isDemo: boolean;
}

export interface VisualizerListItem {
  _id: string;
  name: string;
  imageUrl?: string;
  isDemo: boolean;
}

export interface UserVisual {
  _id: string;
  userId: string;
  visualizerId: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> = { data: T };

export interface ApiError {
  error: {
    message: string;
  };
}

export enum ApiEndpoints {
  // Auth
  AUTH_REGISTER = '/api/v1/auth/register',
  AUTH_LOGIN = '/api/v1/auth/login',
  AUTH_LOGOUT = '/api/v1/auth/logout',

  // User Profile
  USER = '/api/v1/users/user',
  USER_PASSWORD = '/api/v1/users/user/password',

  // User Visuals Collection
  USER_VISUALS = '/api/v1/users/current/visuals',
  USER_VISUALS_BY_ID = '/api/v1/users/current/visuals/:id',

  // Visualizer Catalog
  VISUALIZERS = '/api/v1/visualizers',
  VISUALIZERS_DEMO = '/api/v1/visualizers/demo',
  VISUALIZERS_TAGS = '/api/v1/visualizers/tags',
  VISUALIZERS_BY_ID = '/api/v1/visualizers/:id',

  // Images
  IMAGES_USER = '/api/v1/images/users/user',
  IMAGES_USER_BY_ID = '/api/v1/images/users/:id',
  IMAGES_VISUALIZER_BY_ID = '/api/v1/images/visualizers/:id',
}

// Dynamic endpoint builders

export function buildUserVisualEndpoint(id: string): string {
  return ApiEndpoints.USER_VISUALS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildVisualizerEndpoint(id: string): string {
  return ApiEndpoints.VISUALIZERS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildUserImageEndpoint(id: string): string {
  return ApiEndpoints.IMAGES_USER_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildVisualizerImageEndpoint(id: string): string {
  return ApiEndpoints.IMAGES_VISUALIZER_BY_ID.replace(':id', encodeURIComponent(id));
}
