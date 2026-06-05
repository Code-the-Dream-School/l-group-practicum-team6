export const visualizerQueryKeys = {
  all: ['visualizers'] as const,
  tags: () => [...visualizerQueryKeys.all, 'tags'] as const,
};
