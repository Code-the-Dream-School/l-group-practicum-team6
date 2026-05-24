import { ApiEndpoints } from '@sonix/shared';

export { ApiEndpoints };

// Dynamic endpoint builders
export function buildVisualizerDetailEndpoint(id: string): string {
  return ApiEndpoints.VISUALIZERS_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildVisualizerImageEndpoint(id: string): string {
  return ApiEndpoints.IMAGES_VISUALIZER_BY_ID.replace(':id', encodeURIComponent(id));
}

export function buildSavedVisualEndpoint(id: string): string {
  return ApiEndpoints.USER_VISUALS_BY_ID.replace(':id', encodeURIComponent(id));
}
