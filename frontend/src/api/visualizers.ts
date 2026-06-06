import type { ApiResponse, Visualizer, VisualizerListItem } from '@sonix/shared';
import { API_ROUTES } from '@sonix/shared';
import { apiFetch } from './client';
import { buildVisualizerEndpoint } from './endpoints';

type ListVisualizersParams = {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
};

type ListVisualizersResponse = ApiResponse<VisualizerListItem[]> & {
  total: number;
  page: number;
  pages: number;
};

function buildQuery(params?: ListVisualizersParams): string {
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

export function listVisualizers(params?: ListVisualizersParams): Promise<ListVisualizersResponse> {
  return apiFetch<ListVisualizersResponse>(`${API_ROUTES.VISUALIZERS}${buildQuery(params)}`);
}

export function getVisualizerTags(): Promise<ApiResponse<string[]>> {
  return apiFetch<ApiResponse<string[]>>(API_ROUTES.VISUALIZERS_TAGS);
}

export function getDemoVisualizer(): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(API_ROUTES.VISUALIZERS_DEMO);
}

export function getVisualizer(id: string): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(buildVisualizerEndpoint(id));
}
