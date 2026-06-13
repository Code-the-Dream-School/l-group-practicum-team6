import type { VisualizerListItem } from '@sonix/shared';

import { listVisualizers } from '../api/visualizers';
import { type VisualizerFilters, visualizerQueryKeys } from './visualizerKeys';

export { visualizerQueryKeys };
export type { VisualizerFilters };

export type VisualizerResult = {
  visuals: VisualizerListItem[];
  totalPages: number;
  page: number;
  total: number;
};

export async function fetchVisualizerList(filters: VisualizerFilters): Promise<VisualizerResult> {
  const response = await listVisualizers({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    tag: filters.tag || undefined,
  });

  return {
    visuals: response.data,
    totalPages: Math.max(response.pages, 1),
    page: response.page,
    total: response.total,
  };
}
