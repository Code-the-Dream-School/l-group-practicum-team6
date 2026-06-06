import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../lib/queryClient';
import { visualizerQueryKeys } from './visualizerKeys';

const PLAYBACK_SHUFFLE_GC_MS = 30 * 60_000;

export type PlaybackShuffleState = {
  enabled: boolean;
  order: string[];
};

export const DEFAULT_PLAYBACK_SHUFFLE: PlaybackShuffleState = {
  enabled: false,
  order: [],
};

export function setPlaybackShuffle(state: PlaybackShuffleState): void {
  queryClient.setQueryData(visualizerQueryKeys.playbackShuffle(), state);
}

export function getPlaybackShuffle(): PlaybackShuffleState | undefined {
  return queryClient.getQueryData<PlaybackShuffleState>(visualizerQueryKeys.playbackShuffle());
}

export function usePlaybackShuffle() {
  return useQuery({
    queryKey: visualizerQueryKeys.playbackShuffle(),
    queryFn: (): PlaybackShuffleState => getPlaybackShuffle() ?? DEFAULT_PLAYBACK_SHUFFLE,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: PLAYBACK_SHUFFLE_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
