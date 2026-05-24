import { useEffect, useState } from 'react';
import { getDemoVisualizer, getVisualizer } from '../api';

const glslCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

function getCacheKey(id: string, isDemo: boolean): string {
  return isDemo ? '__demo__' : id;
}

export function getCachedVisualizerGlsl(id: string, isDemo = false): string | null {
  return glslCache.get(getCacheKey(id, isDemo)) ?? null;
}

export function cacheVisualizerGlsl(id: string, glsl: string, isDemo = false): void {
  glslCache.set(getCacheKey(id, isDemo), glsl);
}

export async function loadVisualizerGlsl(id: string, isDemo = false): Promise<string> {
  const cacheKey = getCacheKey(id, isDemo);
  const cached = glslCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const pending = pendingRequests.get(cacheKey);

  if (pending) {
    return pending;
  }

  const request = (async () => {
    try {
      const response = isDemo ? await getDemoVisualizer() : await getVisualizer(id);
      glslCache.set(cacheKey, response.data.glsl);
      return response.data.glsl;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
}

type UsePreviewGlslOptions = {
  enabled: boolean;
  previewGlsl?: string;
  isDemo?: boolean;
};

export function usePreviewGlsl(
  id: string,
  { enabled, previewGlsl, isDemo = false }: UsePreviewGlslOptions
): string | null {
  const cacheKey = getCacheKey(id, isDemo);
  const cachedGlsl = previewGlsl ?? glslCache.get(cacheKey) ?? null;
  const [fetchedGlsl, setFetchedGlsl] = useState<string | null>(null);

  useEffect(() => {
    if (previewGlsl) {
      glslCache.set(cacheKey, previewGlsl);
    }
  }, [previewGlsl, cacheKey]);

  useEffect(() => {
    if (previewGlsl || !enabled || glslCache.has(cacheKey)) {
      return;
    }

    let cancelled = false;

    void loadVisualizerGlsl(id, isDemo)
      .then((glsl) => {
        if (!cancelled) {
          setFetchedGlsl(glsl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedGlsl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, id, previewGlsl, isDemo, cacheKey]);

  return cachedGlsl ?? fetchedGlsl;
}

export function clearPreviewGlslCache() {
  glslCache.clear();
  pendingRequests.clear();
}
