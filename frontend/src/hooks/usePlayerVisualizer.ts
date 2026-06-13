import { useVisualizerQuery, type VisualizerOptions } from './useVisualizerQuery';

export type { PlayerVisual } from '../queries/visualizerDetail';

export function usePlayerVisualizer(id: string, { isDemo = false }: VisualizerOptions = {}) {
  const { data, error, isPending } = useVisualizerQuery(id, { isDemo });

  return {
    glsl: data?.glsl ?? null,
    visual: data?.visual ?? null,
    error,
    isLoading: isPending && !data,
  };
}
