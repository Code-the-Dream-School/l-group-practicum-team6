import type { QueryClient } from '@tanstack/react-query';

import { fetchVisualizerList } from './visualizerList';
import { type VisualizerFilters, visualizerQueryKeys } from './visualizerKeys';
import { getVisualIds } from '../utils/visualizerPlayback';

export async function fetchExploreIds(
  queryClient: QueryClient,
  filters: VisualizerFilters
): Promise<string[]> {
  const firstPageFilters = { ...filters, page: 1 };
  const firstResult = await queryClient.fetchQuery({
    queryKey: visualizerQueryKeys.list(firstPageFilters),
    queryFn: () => fetchVisualizerList(firstPageFilters),
  });

  const ids = getVisualIds(firstResult.visuals);

  for (let page = 2; page <= firstResult.totalPages; page += 1) {
    const pageFilters = { ...filters, page };
    const pageResult = await queryClient.fetchQuery({
      queryKey: visualizerQueryKeys.list(pageFilters),
      queryFn: () => fetchVisualizerList(pageFilters),
    });

    ids.push(...getVisualIds(pageResult.visuals));
  }

  return ids;
}
