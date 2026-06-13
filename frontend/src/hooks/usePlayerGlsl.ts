import { useVisualizerQuery, type VisualizerOptions } from './useVisualizerQuery';

export function usePlayerGlsl(id: string, { isDemo = false }: VisualizerOptions = {}) {
  const { data, error, isPending } = useVisualizerQuery(id, { isDemo });

  return {
    glsl: data?.glsl ?? null,
    error,
    isLoading: isPending,
  };
}
