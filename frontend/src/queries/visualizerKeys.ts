export type VisualizerFilters = {
  page: number;
  limit: number;
  search?: string;
  tag?: string;
};

export const visualizerQueryKeys = {
  all: ['visualizers'] as const,
  tags: () => [...visualizerQueryKeys.all, 'tags'] as const,
  list: (filters: VisualizerFilters) => [...visualizerQueryKeys.all, 'list', filters] as const,
  detail: (id: string, isDemo = false) =>
    [...visualizerQueryKeys.all, 'detail', isDemo ? 'demo' : id] as const,
  saved: () => [...visualizerQueryKeys.all, 'saved'] as const,
  playbackContext: () => [...visualizerQueryKeys.all, 'playback-context'] as const,
  playbackShuffle: () => [...visualizerQueryKeys.all, 'playback-shuffle'] as const,
};
