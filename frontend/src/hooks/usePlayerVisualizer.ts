import { useEffect, useState } from 'react';

import {
  getCachedPlayerVisual,
  getCachedVisualizerGlsl,
  loadVisualizer,
  type PlayerVisual,
} from './usePreviewGlsl';

export type { PlayerVisual };

type UsePlayerVisualizerOptions = {
  isDemo?: boolean;
};

export function usePlayerVisualizer(
  id: string,
  { isDemo = false }: UsePlayerVisualizerOptions = {}
) {
  const cachedGlsl = getCachedVisualizerGlsl(id, isDemo);
  const cachedVisual = getCachedPlayerVisual(id, isDemo);
  const isFullyCached = Boolean(cachedGlsl && cachedVisual);

  const [glsl, setGlsl] = useState<string | null>(() => cachedGlsl);
  const [visual, setVisual] = useState<PlayerVisual | null>(() => cachedVisual);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(() => !isFullyCached);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await loadVisualizer(id, isDemo);

        if (cancelled) return;

        setGlsl(result.glsl);
        setVisual(result.visual);
        setError(null);
      } catch (loadError) {
        if (cancelled) return;

        setGlsl(null);
        setVisual(null);
        setError(loadError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, isDemo]);

  return { glsl, visual, error, isLoading };
}
