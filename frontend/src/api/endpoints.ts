import { API_ROUTES } from '@sonix/shared';

// Dynamic endpoint builders
export function buildVisualizerDetailEndpoint(id: string): string {
  return API_ROUTES.VISUALIZERS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildVisualizerImageEndpoint(id: string): string {
  return API_ROUTES.IMAGES_VISUALIZER_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildSavedVisualEndpoint(id: string): string {
  return API_ROUTES.USER_VISUALS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildAdminVisualizerEndpoint(id: string): string {
  return API_ROUTES.ADMIN_VISUALIZERS_BY_ID.replace(':id', encodeURIComponent(id));
}
