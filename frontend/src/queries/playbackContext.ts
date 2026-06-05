import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../lib/queryClient';
import { type VisualizerListFilters, visualizerQueryKeys } from './visualizerKeys';

export const DEFAULT_EXPLORE_FILTERS: VisualizerListFilters = {
  page: 1,
  limit: 8,
};

export type ExplorePlaybackContext = {
  source: 'explore';
  filters: VisualizerListFilters;
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
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
