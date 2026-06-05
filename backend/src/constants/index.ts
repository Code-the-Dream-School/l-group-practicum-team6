// Backend-only: server middleware, environment-driven, or storage-layer concerns.

export const RATE_LIMIT = {
  WINDOW_MS: 1 * 60 * 1000,
  GLOBAL_MAX_PRODUCTION: 50,
  GLOBAL_MAX_NON_PRODUCTION: 1000,
  AUTH_MAX_PRODUCTION: 50,
  AUTH_MAX_NON_PRODUCTION: 1000,
  GLOBAL_MESSAGE: 'Too many requests, please try again later.',
  AUTH_MESSAGE: 'Too many requests from this IP, please try again after 1 minutes',
} as const;

export const AUTH_CONSTANTS = {
  COOKIE_NAME: 'token',
  COOKIE_LOGOUT_VALUE: 'logout',
  COOKIE_SAME_SITE: 'strict',
  COOKIE_TTL_MS: 1000 * 60 * 60 * 24 * 7,
  JWT_DEFAULT_LIFETIME: '7d',
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
