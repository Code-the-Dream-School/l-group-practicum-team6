import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@sonix/shared';

import {
  DEFAULT_EXPLORE_FILTERS,
  DEFAULT_CONTEXT,
  setPlaybackContext,
  usePlaybackContext,
} from '../queries/playbackContext';
import { fetchExploreIds } from '../queries/fetchPlaylistIds';
import {
  DEFAULT_PLAYBACK_SHUFFLE,
  setPlaybackShuffle,
  usePlaybackShuffle,
} from '../queries/playbackShuffle';
import { prefetchFavPlayback, prefetchPlayback } from '../queries/prefetchPlayback';
import { fetchVisualizerList } from '../queries/visualizerList';
import { visualizerQueryKeys } from '../queries/visualizerKeys';
import {
  getTargetId,
  getLoopedIdOnPage,
  getLoopedVisualId,
  getVisualIds,
  getWrappedPage,
} from '../utils/visualizerPlayback';
import { getSavedVisualIds, sortSavedVisuals } from '../utils/savedVisuals';
import { shuffleIds } from '../utils/shufflePlaylist';
import { useSavedVisualsQuery } from './useSavedVisualsQuery';
import { useVisualizerListQuery } from './useVisualizerListQuery';

function buildVisualizerPath(id: string): string {
  return ROUTES.VISUALIZER.replace(':id', encodeURIComponent(id));
}

export function useVisualizerPlayback(
  currentId: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isShuffleLoading, setIsShuffleLoading] = useState(false);
  const { data: context = DEFAULT_CONTEXT } = usePlaybackContext();
  const { data: shuffleState = DEFAULT_PLAYBACK_SHUFFLE } = usePlaybackShuffle();

  const isFavorites = context.source === 'favorites';
  const exploreFilters = context.source === 'explore' ? context.filters : DEFAULT_EXPLORE_FILTERS;
  const favoritesSort = context.source === 'favorites' ? context.sort : 'recent';

  const { data: listData, isPending: isListPending } = useVisualizerListQuery(exploreFilters, {
    enabled: enabled && !isFavorites,
  });
  const { data: savedVisuals = [], isPending: isSavedPending } = useSavedVisualsQuery({
    enabled: enabled && isFavorites,
  });

  const favoriteIds = useMemo(
    () => getSavedVisualIds(sortSavedVisuals(savedVisuals, favoritesSort)),
    [favoritesSort, savedVisuals]
  );

  const idsOnPage = isFavorites ? favoriteIds : getVisualIds(listData?.visuals ?? []);
  const currentIndex = idsOnPage.indexOf(currentId);
  const currentPage = exploreFilters.page;
  const totalPages = isFavorites ? 1 : (listData?.totalPages ?? 1);
  const isPlaylistPending = isFavorites ? isSavedPending : isListPending;
  const isShuffled = shuffleState.enabled;
  const shuffleOrder = shuffleState.order;
  const playbackListKey = isFavorites
    ? `favorites:${favoritesSort}`
    : `explore:${exploreFilters.page}:${exploreFilters.limit}:${exploreFilters.search ?? ''}:${exploreFilters.tag ?? ''}`;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setPlaybackShuffle(DEFAULT_PLAYBACK_SHUFFLE);
  }, [enabled, playbackListKey]);

  useEffect(() => {
    if (!enabled || isPlaylistPending || idsOnPage.length === 0) {
      return;
    }

    if (isShuffled && shuffleOrder.length > 0) {
      prefetchFavPlayback({
        queryClient,
        ids: shuffleOrder,
        currentIndex: shuffleOrder.indexOf(currentId),
      });
      return;
    }

    if (isFavorites) {
      prefetchFavPlayback({
        queryClient,
        ids: idsOnPage,
        currentIndex,
      });
      return;
    }

    if (totalPages < 1) {
      return;
    }

    void prefetchPlayback({
      queryClient,
      idsOnPage,
      currentIndex,
      currentPage,
      totalPages,
      filters: exploreFilters,
    });
  }, [
    currentIndex,
    currentPage,
    enabled,
    exploreFilters,
    idsOnPage,
    currentId,
    isFavorites,
    isPlaylistPending,
    isShuffled,
    queryClient,
    shuffleOrder,
    totalPages,
  ]);

  const navigateToVisualizer = useCallback(
    (id: string) => {
      navigate(buildVisualizerPath(id), { replace: true });
    },
    [navigate]
  );

  const goToFavoritesAdjacent = useCallback(
    (direction: 'next' | 'previous') => {
      if (isNavigating || isSavedPending || favoriteIds.length === 0) {
        return;
      }

      const targetId = getLoopedVisualId(favoriteIds, currentIndex, direction);

      if (!targetId) {
        return;
      }

      navigateToVisualizer(targetId);
    },
    [currentIndex, favoriteIds, isNavigating, isSavedPending, navigateToVisualizer]
  );

  const goToExploreAdjacent = useCallback(
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
        const nextFilters = { ...exploreFilters, page: nextPage };
        const result = await queryClient.fetchQuery({
          queryKey: visualizerQueryKeys.list(nextFilters),
          queryFn: () => fetchVisualizerList(nextFilters),
        });
        const boundaryIds = getVisualIds(result.visuals);
        const targetId = getTargetId(boundaryIds, direction);

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
      exploreFilters,
      idsOnPage,
      isListPending,
      isNavigating,
      navigateToVisualizer,
      queryClient,
      totalPages,
    ]
  );

  const goToShuffledAdjacent = useCallback(
    (direction: 'next' | 'previous') => {
      if (isNavigating || shuffleOrder.length === 0) {
        return;
      }

      const targetId = getLoopedVisualId(shuffleOrder, shuffleOrder.indexOf(currentId), direction);

      if (!targetId) {
        return;
      }

      navigateToVisualizer(targetId);
    },
    [currentId, isNavigating, navigateToVisualizer, shuffleOrder]
  );

  const goToAdjacent = useCallback(
    (direction: 'next' | 'previous') => {
      if (isShuffled) {
        goToShuffledAdjacent(direction);
        return;
      }

      if (isFavorites) {
        goToFavoritesAdjacent(direction);
        return;
      }

      void goToExploreAdjacent(direction);
    },
    [goToExploreAdjacent, goToFavoritesAdjacent, goToShuffledAdjacent, isFavorites, isShuffled]
  );

  const toggleShuffle = useCallback(async () => {
    if (isShuffled) {
      setPlaybackShuffle(DEFAULT_PLAYBACK_SHUFFLE);
      return;
    }

    if (isShuffleLoading || isPlaylistPending) {
      return;
    }

    setIsShuffleLoading(true);

    try {
      const orderedIds = isFavorites
        ? favoriteIds
        : await fetchExploreIds(queryClient, exploreFilters);

      if (orderedIds.length === 0) {
        return;
      }

      setPlaybackShuffle({
        enabled: true,
        order: shuffleIds(orderedIds),
      });
    } finally {
      setIsShuffleLoading(false);
    }
  }, [
    exploreFilters,
    favoriteIds,
    isFavorites,
    isPlaylistPending,
    isShuffled,
    isShuffleLoading,
    queryClient,
  ]);

  const goNext = useCallback(() => {
    goToAdjacent('next');
  }, [goToAdjacent]);

  const goPrevious = useCallback(() => {
    goToAdjacent('previous');
  }, [goToAdjacent]);

  return {
    goNext,
    goPrevious,
    isNavigating,
    isShuffled,
    isShuffleLoading,
    toggleShuffle,
  };
}
