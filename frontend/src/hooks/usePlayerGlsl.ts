import { useEffect, useState } from 'react';
import { getCachedVisualizerGlsl, loadVisualizerGlsl } from './usePreviewGlsl';

type UsePlayerGlslOptions = {
  isDemo?: boolean;
};

export function usePlayerGlsl(id: string, { isDemo = false }: UsePlayerGlslOptions = {}) {
  const [glsl, setGlsl] = useState<string | null>(() => getCachedVisualizerGlsl(id, isDemo));
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(() => !getCachedVisualizerGlsl(id, isDemo));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const shader = await loadVisualizerGlsl(id, isDemo);

        if (cancelled) return;

        setGlsl(shader);
        setError(null);
      } catch (loadError) {
        if (cancelled) return;

        setGlsl(null);
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

  return { glsl, error, isLoading };
}
