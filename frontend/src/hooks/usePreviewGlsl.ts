import { useEffect, useState } from 'react';
import type { Visualizer } from '@sonix/shared';

import { getDemoVisualizer, getVisualizer } from '../api';

export type PlayerVisual = {
  id: string;
  name: string;
  tags: string[];
  isDemo?: boolean;
};

type VisualizerCacheEntry = {
  glsl: string;
  visual: PlayerVisual;
};

const glslCache = new Map<string, string>();
const visualMetaCache = new Map<string, PlayerVisual>();
const pendingRequests = new Map<string, Promise<VisualizerCacheEntry>>();

function getCacheKey(id: string, isDemo: boolean): string {
  return isDemo ? '__demo__' : id;
}

function toPlayerVisual(visualizer: Visualizer): PlayerVisual {
  return {
    id: visualizer._id,
    name: visualizer.name,
    tags: visualizer.tags ?? [],
    isDemo: visualizer.isDemo,
  };
}

export function getCachedVisualizerGlsl(id: string, isDemo = false): string | null {
  return glslCache.get(getCacheKey(id, isDemo)) ?? null;
}

export function getCachedPlayerVisual(id: string, isDemo = false): PlayerVisual | null {
  return visualMetaCache.get(getCacheKey(id, isDemo)) ?? null;
}

export function cacheVisualizerGlsl(id: string, glsl: string, isDemo = false): void {
  glslCache.set(getCacheKey(id, isDemo), glsl);
}

export async function loadVisualizer(id: string, isDemo = false): Promise<VisualizerCacheEntry> {
  const cacheKey = getCacheKey(id, isDemo);
  const cachedGlsl = glslCache.get(cacheKey);
  const cachedVisual = visualMetaCache.get(cacheKey);

  if (cachedGlsl && cachedVisual) {
    return { glsl: cachedGlsl, visual: cachedVisual };
  }

  const pending = pendingRequests.get(cacheKey);

  if (pending) {
    return pending;
  }

  const request = (async (): Promise<VisualizerCacheEntry> => {
    const response = isDemo ? await getDemoVisualizer() : await getVisualizer(id);
    const entry: VisualizerCacheEntry = {
      glsl: response.data.glsl,
      visual: toPlayerVisual(response.data),
    };

    glslCache.set(cacheKey, entry.glsl);
    visualMetaCache.set(cacheKey, entry.visual);
    return entry;
  })();

  const tracked = request.finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, tracked);
  return tracked;
}

export async function loadVisualizerGlsl(id: string, isDemo = false): Promise<string> {
  const cacheKey = getCacheKey(id, isDemo);
  const cached = glslCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const { glsl } = await loadVisualizer(id, isDemo);
  return glsl;
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
  visualMetaCache.clear();
  pendingRequests.clear();
}
