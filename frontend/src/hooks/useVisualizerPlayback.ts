import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@sonix/shared';

import {
  DEFAULT_EXPLORE_FILTERS,
  setPlaybackContext,
  usePlaybackContext,
} from '../queries/playbackContext';
import { fetchVisualizerList } from '../queries/visualizerList';
import { visualizerQueryKeys } from '../queries/visualizerKeys';
import {
  getBoundaryPageTargetId,
  getLoopedIdOnPage,
  getNonDemoVisualIds,
  getWrappedPage,
} from '../utils/visualizerPlayback';
import { useVisualizerListQuery } from './useVisualizerListQuery';

function buildVisualizerPath(id: string): string {
  return ROUTES.VISUALIZER.replace(':id', encodeURIComponent(id));
}

export function useVisualizerPlayback(currentId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNavigating, setIsNavigating] = useState(false);
  const { data: context = { source: 'explore', filters: DEFAULT_EXPLORE_FILTERS } } =
    usePlaybackContext();

  const filters = context.source === 'explore' ? context.filters : DEFAULT_EXPLORE_FILTERS;
  const { data: listData, isPending: isListPending } = useVisualizerListQuery(filters);

  const idsOnPage = getNonDemoVisualIds(listData?.visuals ?? []);
  const currentIndex = idsOnPage.indexOf(currentId);
  const currentPage = filters.page;
  const totalPages = listData?.totalPages ?? 1;

  const navigateToVisualizer = useCallback(
    (id: string) => {
      navigate(buildVisualizerPath(id), { replace: true });
    },
    [navigate]
  );

  const goToAdjacent = useCallback(
    async (direction: 'next' | 'previous') => {
      if (isNavigating || totalPages < 1 || (isListPending && idsOnPage.length === 0)) {
        return;
      }

      const onPageTarget = getLoopedIdOnPage(idsOnPage, currentIndex, direction);

      if (onPageTarget) {
        navigateToVisualizer(onPageTarget);
        return;
      }

      setIsNavigating(true);

      try {
        const nextPage = getWrappedPage(currentPage, direction, totalPages);
        const nextFilters = { ...filters, page: nextPage };
        const result = await queryClient.fetchQuery({
          queryKey: visualizerQueryKeys.list(nextFilters),
          queryFn: () => fetchVisualizerList(nextFilters),
        });
        const boundaryIds = getNonDemoVisualIds(result.visuals);
        const targetId = getBoundaryPageTargetId(boundaryIds, direction);

        if (!targetId) {
          return;
        }

        setPlaybackContext({ source: 'explore', filters: nextFilters });
        navigateToVisualizer(targetId);
      } finally {
        setIsNavigating(false);
      }
    },
    [
      currentIndex,
      currentPage,
      filters,
      idsOnPage,
      isListPending,
      isNavigating,
      navigateToVisualizer,
      queryClient,
      totalPages,
    ]
  );

  const goNext = useCallback(() => {
    void goToAdjacent('next');
  }, [goToAdjacent]);

  const goPrevious = useCallback(() => {
    void goToAdjacent('previous');
  }, [goToAdjacent]);

  return {
    goNext,
    goPrevious,
    isNavigating,
  };
}
