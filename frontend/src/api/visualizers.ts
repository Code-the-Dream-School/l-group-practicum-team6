import type { ApiResponse, Visualizer } from '@sonix/shared';
import { apiFetch } from './client';

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
  return apiFetch<ApiResponse<ListVisualizersData>>(`/api/visualizers${buildQuery(params)}`
);
}

export function getDemoVisualizer(): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>('/api/visualizers/demo');
}

export function getVisualizer(id: string): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(`/api/visualizers/${id}`);
}