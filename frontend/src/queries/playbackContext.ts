import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../lib/queryClient';
import { type VisualizerFilters, visualizerQueryKeys } from './visualizerKeys';

const PLAYBACK_CONTEXT_STALE_MS = 60_000;
const PLAYBACK_CONTEXT_GC_MS = 30 * 60_000;

export const DEFAULT_EXPLORE_FILTERS: VisualizerFilters = {
  page: 1,
  limit: 8,
};

export type ExplorePlaybackContext = {
  source: 'explore';
  filters: VisualizerFilters;
};

export type PlaybackContext = ExplorePlaybackContext;

export function setPlaybackContext(context: PlaybackContext): void {
  queryClient.setQueryData(visualizerQueryKeys.playbackContext(), context);
}

export function getPlaybackContext(): PlaybackContext | undefined {
  return queryClient.getQueryData<PlaybackContext>(visualizerQueryKeys.playbackContext());
}

export function usePlaybackContext() {
  return useQuery({
    queryKey: visualizerQueryKeys.playbackContext(),
    queryFn: () => getPlaybackContext() ?? { source: 'explore', filters: DEFAULT_EXPLORE_FILTERS },
    staleTime: PLAYBACK_CONTEXT_STALE_MS,
    gcTime: PLAYBACK_CONTEXT_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
