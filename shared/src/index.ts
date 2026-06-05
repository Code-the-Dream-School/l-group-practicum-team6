export const API_BASE_PATH = '/api/v1';

export const API_ROUTES = {
  HEALTH: `${API_BASE_PATH}/health`,
  AUTH: `${API_BASE_PATH}/auth`,
  USERS: `${API_BASE_PATH}/users`,
  VISUALIZERS: `${API_BASE_PATH}/visualizers`,
  IMAGES: `${API_BASE_PATH}/images`,
} as const;

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
  tags?: string[];
}

export interface VisualizerListItem {
  _id: string;
  name: string;
  imageUrl?: string;
  isDemo: boolean;
  tags?: string[];
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

export const API_SUCCESS_MESSAGES = {
  USER_LOGGED_OUT: 'user logged out!',
  PASSWORD_UPDATED: 'Password updated',
  REMOVED_FROM_COLLECTION: 'Removed from collection',
} as const;

export const API_ERROR_MESSAGES = {
  AUTHENTICATION_INVALID: 'Authentication Invalid',
  INVALID_CREDENTIALS: 'Invalid Credentials',
  USER_NOT_FOUND: 'User not found',
  VISUALIZER_NOT_FOUND: 'Visualizer not found',
  VISUALIZER_NOT_FOUND_IN_COLLECTION: 'Visualizer not found in collection',
  NO_DEMO_VISUALIZER_FOUND: 'No demo visualizer found',
  IMAGE_NOT_FOUND: 'Image not found',
  INVALID_USER_ID: 'Invalid user ID',
  INVALID_VISUALIZER_ID: 'Invalid visualizer ID',
  PLEASE_PROVIDE_NAME_EMAIL_PASSWORD: 'Please provide name, email and password',
  PLEASE_PROVIDE_EMAIL_PASSWORD: 'Please provide email and password',
  PLEASE_PROVIDE_NAME_OR_EMAIL: 'Please provide name or email',
  PLEASE_PROVIDE_ALL_PASSWORD_FIELDS: 'Please provide all password fields',
  PLEASE_PROVIDE_PASSWORD: 'Please provide password',
  PLEASE_PROVIDE_IMAGE: 'Please provide an image',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  NEW_PASSWORD_MUST_DIFFER: 'New password must be different from current password',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  INVALID_PASSWORD: 'Invalid password',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  VISUALIZER_ALREADY_IN_COLLECTION: 'Visualizer already in collection',
  UNSUPPORTED_FILE_TYPE: 'Unsupported file type',
  IMAGE_SIZE_EXCEEDS_LIMIT: 'Image size exceeds 5 MB limit',
  INVALID_FILE_TYPE: 'Invalid file type',
} as const;

export const VISUALIZER_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MIN_LIMIT: 1,
  MAX_LIMIT: 50,
} as const;

export const TOAST_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back!',
    LOGIN_FALLBACK_ERROR: 'Login error',
    LOGIN_MISSING_FIELDS: 'Please fill in email and password',
    SIGNUP_SUCCESS: 'Account created successfully!',
    SIGNUP_FALLBACK_ERROR: 'Registration error',
    SIGNUP_PASSWORDS_MISMATCH: 'Passwords do not match',
    SIGNUP_PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
    SIGNUP_MISSING_FIELDS: 'Please fill in name and email',
  },
  VISUALIZER: {
    SAVED_TO_FAVORITES: 'Visualizer saved to favorites.',
    REMOVED_FROM_FAVORITES: 'Visualizer removed from favorites.',
    LOAD_FAILED: 'Unable to load visualizers',
    LOAD_SAVED_FAILED: 'Unable to load saved visualizers',
    SAVE_FAILED: 'Unable to save visualizer',
    REMOVE_FAILED: 'Unable to remove visualizer',
  },
} as const;
