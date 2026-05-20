import { ApiEndpoints, type ApiResponse, type User, type Visualizer } from '@sonix/shared';
import { apiFetch } from './client';
import { buildVisualizerImageEndpoint } from './endpoints';

export function uploadAvatar(file: File): Promise<ApiResponse<User>> {
  const formData = new FormData();
  formData.append('avatar', file);

  return apiFetch<ApiResponse<User>>(ApiEndpoints.IMAGES_AVATAR, {
    method: 'POST',
    body: formData,
  });
}

export function deleteAvatar(): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>(ApiEndpoints.IMAGES_AVATAR, {
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
