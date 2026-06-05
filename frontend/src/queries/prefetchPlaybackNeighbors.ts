import type { QueryClient } from '@tanstack/react-query';

import { fetchVisualizerDetail } from './visualizerDetail';
import { fetchVisualizerList, type VisualizerResult } from './visualizerList';
import { type VisualizerFilters, visualizerQueryKeys } from './visualizerKeys';
import {
  getBoundaryPageTargetId,
  getLoopedIdOnPage,
  getVisualIds,
  getWrappedPage,
} from '../utils/visualizerPlayback';

type PrefetchOptions = {
  queryClient: QueryClient;
  idsOnPage: string[];
  currentIndex: number;
  currentPage: number;
  totalPages: number;
  filters: VisualizerFilters;
};

function prefetchVisualizer(queryClient: QueryClient, id: string | null): void {
  if (!id) {
    return;
  }

  void queryClient.prefetchQuery({
    queryKey: visualizerQueryKeys.detail(id),
    queryFn: () => fetchVisualizerDetail(id),
    staleTime: 5 * 60000,
  });
}

async function prefetchAdjacent(
  queryClient: QueryClient,
  filters: VisualizerFilters,
  direction: 'next' | 'previous',
  currentPage: number,
  totalPages: number
): Promise<string | null> {
  const wrappedPage = getWrappedPage(currentPage, direction, totalPages);
  const wrappedFilters = { ...filters, page: wrappedPage };

  await queryClient.prefetchQuery({
    queryKey: visualizerQueryKeys.list(wrappedFilters),
    queryFn: () => fetchVisualizerList(wrappedFilters),
  });

  const listResult = queryClient.getQueryData<VisualizerResult>(
    visualizerQueryKeys.list(wrappedFilters)
  );

  if (!listResult) {
    return null;
  }

  return getBoundaryPageTargetId(getVisualIds(listResult.visuals), direction);
}

export async function prefetchPlaybackNeighbors({
  queryClient,
  idsOnPage,
  currentIndex,
  currentPage,
  totalPages,
  filters,
}: PrefetchOptions): Promise<void> {
  if (totalPages < 1) {
    return;
  }

  const directions: Array<'next' | 'previous'> = ['next', 'previous'];

  await Promise.all(
    directions.map(async (direction) => {
      const onPageTarget = getLoopedIdOnPage(idsOnPage, currentIndex, direction);

      if (onPageTarget) {
        prefetchVisualizer(queryClient, onPageTarget);
        return;
      }

      if (idsOnPage.length === 0) {
        return;
      }

      const boundaryTarget = await prefetchAdjacent(
        queryClient,
        filters,
        direction,
        currentPage,
        totalPages
      );

      prefetchVisualizer(queryClient, boundaryTarget);
    })
  );
}
