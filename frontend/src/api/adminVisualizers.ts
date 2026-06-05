import { API_ROUTES, type ApiResponse, type Visualizer } from '@sonix/shared';
import { buildAdminVisualizerEndpoint } from './endpoints';
import { apiFetch } from './client';

export type AdminVisualizerPayload = {
  name?: string;
  source?: string;
  imageUrl?: string;
  glsl?: string;
  isDemo?: boolean;
  tags?: string[];
};

export function createAdminVisualizer(
  payload: Required<Pick<AdminVisualizerPayload, 'name' | 'glsl'>> & AdminVisualizerPayload
): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(API_ROUTES.ADMIN_VISUALIZERS, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminVisualizer(
  id: string,
  payload: AdminVisualizerPayload
): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(buildAdminVisualizerEndpoint(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminVisualizer(id: string): Promise<void> {
  return apiFetch<void>(buildAdminVisualizerEndpoint(id), {
    method: 'DELETE',
  });
}
