export enum ApiEndpoints {
  // Authentication
  AUTH_LOGIN = '/api/auth/login',
  AUTH_LOGOUT = '/api/auth/logout',
  AUTH_REGISTER = '/api/auth/register',
  AUTH_USER = '/api/auth/user',

  // Users
  USERS_PROFILE = '/api/users/profile',
  USERS_PASSWORD = '/api/users/password',
  USERS_ACCOUNT = '/api/users/account',
  USERS_SAVED_VISUALS = '/api/v1/users/current/visuals',

  // Visualizers
  VISUALIZERS = '/api/visualizers',
  VISUALIZERS_DEMO = '/api/visualizers/demo',
  VISUALIZERS_DETAIL = '/api/visualizers/{id}',

  // Images
  IMAGES_AVATAR = '/api/images/avatar',
  IMAGES_VISUALIZER = '/api/images/visualizers/{id}',
}

// Dynamic endpoint builders
export function buildVisualizerDetailEndpoint(id: string): string {
  return ApiEndpoints.VISUALIZERS_DETAIL.replace('{id}', encodeURIComponent(id));
}

export function buildVisualizerImageEndpoint(id: string): string {
  return ApiEndpoints.IMAGES_VISUALIZER.replace('{id}', encodeURIComponent(id));
}

export function buildSavedVisualEndpoint(id: string): string {
  return `${ApiEndpoints.USERS_SAVED_VISUALS}/${encodeURIComponent(id)}`;
}
