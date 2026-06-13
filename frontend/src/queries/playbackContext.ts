import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../lib/queryClient';
import type { FavoritesSortOption } from '../utils/savedVisuals';
import { type VisualizerFilters, visualizerQueryKeys } from './visualizerKeys';

const PLAYBACK_CONTEXT_STALE_MS = 60_000;
const PLAYBACK_CONTEXT_GC_MS = 30 * 60_000;

export const DEFAULT_EXPLORE_FILTERS: VisualizerFilters = {
  page: 1,
  limit: 8,
};

export type ExploreContext = {
  source: 'explore';
  filters: VisualizerFilters;
};

export type FavoritesContext = {
  source: 'favorites';
  sort: FavoritesSortOption;
};

export type PlaybackContext = ExploreContext | FavoritesContext;

export const DEFAULT_CONTEXT: ExploreContext = {
  source: 'explore',
  filters: DEFAULT_EXPLORE_FILTERS,
};

export function setPlaybackContext(context: PlaybackContext): void {
  queryClient.setQueryData(visualizerQueryKeys.playbackContext(), context);
}

export function getPlaybackContext(): PlaybackContext | undefined {
  return queryClient.getQueryData<PlaybackContext>(visualizerQueryKeys.playbackContext());
}

export function usePlaybackContext() {
  return useQuery({
    queryKey: visualizerQueryKeys.playbackContext(),
    queryFn: (): PlaybackContext => getPlaybackContext() ?? DEFAULT_CONTEXT,
    staleTime: PLAYBACK_CONTEXT_STALE_MS,
    gcTime: PLAYBACK_CONTEXT_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
