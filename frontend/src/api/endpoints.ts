import { API_ROUTES } from '@sonix/shared';

// Dynamic endpoint builders
export function buildVisualizerEndpoint(id: string): string {
  return API_ROUTES.VISUALIZERS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildVisualizerImageEndpoint(id: string): string {
  return API_ROUTES.VISUALIZER_IMAGES_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildUserVisualEndpoint(id: string): string {
  return API_ROUTES.CURRENT_USER_VISUALS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildAdminVisualizerEndpoint(id: string): string {
  return API_ROUTES.ADMIN_VISUALIZERS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildUserImageEndpoint(id: string): string {
  return API_ROUTES.USER_IMAGE_BY_ID.replace(':id', encodeURIComponent(id));
}
