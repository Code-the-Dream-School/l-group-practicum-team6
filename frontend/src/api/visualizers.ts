import type { ApiResponse, Visualizer } from '@sonix/shared';
import { apiFetch } from './client';
import { ApiEndpoints, buildVisualizerDetailEndpoint } from './endpoints';

type ListVisualizersParams = {
  search?: string;
  page?: number;
  limit?: number;
};

type ListVisualizersData = {
  visualizers: Visualizer[];
};

function buildQuery(
  params?: ListVisualizersParams
): string {
  if (!params) return '';

  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';  
}

export function listVisualizers(
  params?: ListVisualizersParams
): Promise<ApiResponse<ListVisualizersData>> {
  return apiFetch<ApiResponse<ListVisualizersData>>(`${ApiEndpoints.VISUALIZERS}${buildQuery(params)}`
);
}

export function getDemoVisualizer(): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(ApiEndpoints.VISUALIZERS_DEMO);
}

export function getVisualizer(id: string): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(buildVisualizerDetailEndpoint(id));
}