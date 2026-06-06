export const API_BASE_PATH = '/api/v1';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  image?: string;
  isAdmin?: boolean;
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

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  EXPLORE: '/explore',
  ADMIN_VISUALS: '/admin/visualizers',
  VISUALIZER_DEMO: '/visualizer/demo',
  VISUALIZER: '/visualizer/:id',
  MY_VISUALS: '/my-visuals',
  NOT_FOUND: '*',
  SETTINGS: '/settings',
};

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

export const API_ROUTES = {
  HEALTH: `${API_BASE_PATH}/health`,
  AUTH: `${API_BASE_PATH}/auth`,
  USERS: `${API_BASE_PATH}/users`,
  IMAGES: `${API_BASE_PATH}/images`,

  // Auth
  AUTH_REGISTER: `${API_BASE_PATH}/auth/register`,
  AUTH_LOGIN: `${API_BASE_PATH}/auth/login`,
  AUTH_LOGOUT: `${API_BASE_PATH}/auth/logout`,

  // User Profile
  CURRENT_USER: `${API_BASE_PATH}/users/current`,
  CURRENT_USER_PASSWORD: `${API_BASE_PATH}/users/current/password`,

  // User Visuals Collection
  CURRENT_USER_VISUALS: `${API_BASE_PATH}/users/current/visuals`,
  CURRENT_USER_VISUALS_BY_ID: `${API_BASE_PATH}/users/current/visuals/:id`,

  // Visualizer Catalog
  VISUALIZERS: `${API_BASE_PATH}/visualizers`,
  VISUALIZERS_DEMO: `${API_BASE_PATH}/visualizers/demo`,
  VISUALIZERS_TAGS: `${API_BASE_PATH}/visualizers/tags`,
  VISUALIZERS_BY_ID: `${API_BASE_PATH}/visualizers/:id`,

  // Admin Visualizer Management
  ADMIN_VISUALIZERS: `${API_BASE_PATH}/admin/visualizers`,
  ADMIN_VISUALIZERS_BY_ID: `${API_BASE_PATH}/admin/visualizers/:id`,

  // Images
  CURRENT_USER_IMAGE: `${API_BASE_PATH}/images/users/current`,
  USER_IMAGE_BY_ID: `${API_BASE_PATH}/images/users/:id`,
  VISUALIZER_IMAGES_BY_ID: `${API_BASE_PATH}/images/visualizers/:id`,
} as const;

export const LABELS = {
  EXPLORE: 'Explore',
  MY_VISUALS: 'My Visuals',
  SETTINGS: 'Settings',
  LOG_OUT: 'Log Out',
  LOG_IN: 'Log In',
  SIGN_UP: 'Sign Up',
  SIGN_UP_CTA: 'Sign Up to unlock all visualizers',
} as const;
