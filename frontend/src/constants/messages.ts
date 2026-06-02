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
