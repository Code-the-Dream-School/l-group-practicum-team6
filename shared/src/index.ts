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

export interface GenerateVisualizerRequest {
  systemInstruction: {
    parts: Array<{ text: string }>;
  };
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}
export const TOKEN_LIMIT = 8192;
export const DEFAULT_SYSTEM_PROMPT = `
You are an expert GLSL fragment shader author for a WebGL2 audio visualizer.
Generate a complete fragment shader that reacts to live microphone audio via a 2D FFT texture. Make sure not to exceed limit of ${TOKEN_LIMIT} tokens.

## Required declarations (exact uniform names)

\`\`\`glsl
precision highp float;
precision highp int;

uniform vec3      iResolution;
uniform float     iTime;
uniform float     iTimeDelta;
uniform float     iFrameRate;
uniform int       iFrame;
uniform float     iChannelTime[4];
uniform vec3      iChannelResolution[4];
uniform vec4      iMouse;
uniform vec4      iDate;
uniform sampler2D iChannel0;
out vec4 fragColor;
\`\`\`

## Audio sampling

Use this pattern (or an equivalent getAudio helper):

\`\`\`glsl
float getAudio(float freq) {
    return texture(iChannel0, vec2(fract(freq), 0.25)).x;
}
\`\`\`

Sample bass (~0.05), mids (~0.4), treble (~0.8) to drive motion, color, and glow.

## Entry point

Implement \`void mainImage(out vec4 fragColor, in vec2 fragCoord)\` for all rendering logic, then:

\`\`\`glsl
void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}
\`\`\`

## Technical rules

- GLSL 300 es / WebGL2 only.
- Do NOT include a #version directive.
- Normalize coordinates with iResolution.y for aspect-correct visuals.
- Use iTime for animation; iMouse is optional.
- Output ONLY the raw fragment shader source code.
- No markdown fences, no explanations, no comments outside the shader unless brief and inside the GLSL.
`.trim();

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
  ADMIN_VISUALS_CREATE: '/admin/visualizers/create',
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
  SETTINGS: {
    NAME_UPDATED: 'Name updated successfully.',
    PASSWORD_UPDATED: 'Password updated successfully.',
    PASSWORD_MISMATCH: 'New password and Confirm Password do not match',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
    NAME_UPDATE_FAILED: 'Failed to save changes',
    PASSWORD_UPDATE_FAILED: 'Failed to update password',
    DELETE_FAILED: 'Failed to delete account',
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
  ADMIN_VISUALIZERS_GENERATE: `${API_BASE_PATH}/admin/visualizers/generate`,

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
  CREATE_VISUALIZER: 'Create',
} as const;

export const PASSWORD_MIN_LENGTH = 8;

export const SETTINGS_LABELS = {
  PROFILE: 'Profile',
  ACCOUNT: 'Account',
  CHANGE_PASSWORD: 'Change Password',
  DANGER_ZONE: 'Danger Zone',
  AVATAR_HINT: 'Avatar is generated from your name and account ID.',
  DISPLAY_NAME: 'Display Name',
  DISPLAY_NAME_INFO_ARIA: 'Display name info',
  DISPLAY_NAME_TOOLTIP: 'Your display name is saved when you click the update button.',
  INFO_ICON: 'i',
  EMAIL_ADDRESS: 'Email Address',
  CURRENT_PASSWORD: 'Current Password',
  NEW_PASSWORD: 'New Password',
  CONFIRM_PASSWORD: 'Confirm Password',
  UPDATE_NAME: 'Update Name',
  UPDATE_PASSWORD: 'Update Password',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
  CANCEL: 'Cancel',
  DELETE_ACCOUNT: 'Delete Account',
  DELETE_CARD_TITLE: 'Delete account',
  DELETE_CARD_DESC:
    'Permanently delete your account and all associated data. This action cannot be undone.',
  DELETE_MODAL_DESC:
    'This action is permanent and cannot be undone. Enter your password to confirm.',
} as const;
