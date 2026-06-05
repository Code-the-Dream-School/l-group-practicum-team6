import type { ApiResponse, User, Visualizer } from '@sonix/shared';
import { API_ROUTES } from '@sonix/shared';
import { buildVisualizerImageEndpoint } from './endpoints';
import { apiFetch } from './client';

export function uploadAvatar(file: File): Promise<ApiResponse<User>> {
  const formData = new FormData();
  formData.append('image', file);

  return apiFetch<ApiResponse<User>>(API_ROUTES.IMAGES_USER, {
    method: 'POST',
    body: formData,
  });
}

export function deleteAvatar(): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>(API_ROUTES.IMAGES_USER, {
    method: 'DELETE',
  });
}

export function uploadVisualizerImage(
  visualizerId: string,
  file: File
): Promise<ApiResponse<Visualizer>> {
  const formData = new FormData();
  formData.append('image', file);

  return apiFetch<ApiResponse<Visualizer>>(buildVisualizerImageEndpoint(visualizerId), {
    method: 'POST',
    body: formData,
  });
}

export function deleteVisualizerImage(visualizerId: string): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(buildVisualizerImageEndpoint(visualizerId), {
    method: 'DELETE',
  });
}
