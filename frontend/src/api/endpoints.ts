export enum ApiEndpoints {
  // Authentication
  AUTH_LOGIN = '/api/v1/auth/login',
  AUTH_LOGOUT = '/api/v1/auth/logout',
  AUTH_REGISTER = '/api/v1/auth/register',
  AUTH_USER = '/api/v1/auth/user',

  // Users
  USERS_PROFILE = '/api/v1/users/profile',
  USERS_PASSWORD = '/api/v1/users/password',
  USERS_ACCOUNT = '/api/v1/users/account',
  USERS_SAVED_VISUALS = '/api/v1/users/current/visuals',

  // Visualizers
  VISUALIZERS = '/api/v1/visualizers',
  VISUALIZERS_DEMO = '/api/v1/visualizers/demo',
  VISUALIZERS_DETAIL = '/api/v1/visualizers/{id}',

  // Images
  IMAGES_USER = '/api/v1/images/users/user',
  IMAGES_USER_BY_ID = '/api/v1/images/users/:id',
  IMAGES_VISUALIZER_BY_ID = '/api/v1/images/visualizers/:id',
}

// Dynamic endpoint builders
export function buildVisualizerDetailEndpoint(id: string): string {
  return ApiEndpoints.VISUALIZERS_DETAIL.replace(':id', encodeURIComponent(id));
}

export function buildVisualizerImageEndpoint(id: string): string {
  return ApiEndpoints.IMAGES_VISUALIZER_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildSavedVisualEndpoint(id: string): string {
  return `${ApiEndpoints.USERS_SAVED_VISUALS}/${encodeURIComponent(id)}`;
}
