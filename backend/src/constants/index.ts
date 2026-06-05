export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,
  GLOBAL_MAX_PRODUCTION: 100,
  GLOBAL_MAX_NON_PRODUCTION: 1000,
  AUTH_MAX_PRODUCTION: 20,
  AUTH_MAX_NON_PRODUCTION: 1000,
  GLOBAL_MESSAGE: 'Too many requests, please try again later.',
  AUTH_MESSAGE: 'Too many requests from this IP, please try again after 15 minutes',
} as const;

export const AUTH_CONSTANTS = {
  COOKIE_NAME: 'token',
  COOKIE_LOGOUT_VALUE: 'logout',
  COOKIE_SAME_SITE: 'strict',
  COOKIE_TTL_MS: 1000 * 60 * 60 * 24 * 7,
  JWT_DEFAULT_LIFETIME: '7d',
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
  ADMIN_ACCESS_REQUIRED: 'Admin access required',
} as const;

export const API_SUCCESS_MESSAGES = {
  USER_LOGGED_OUT: 'user logged out!',
  PASSWORD_UPDATED: 'Password updated',
  REMOVED_FROM_COLLECTION: 'Removed from collection',
} as const;

export const VISUALIZER_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MIN_LIMIT: 1,
  MAX_LIMIT: 50,
} as const;

export const GRIDFS_BUCKETS = {
  IMAGES: 'images',
  SHADERS: 'shaders',
} as const;

export type GridFsBucketName = (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS];

export const IMAGE_OWNER_TYPES = {
  USER: 'user',
  VISUALIZER: 'visualizer',
} as const;
