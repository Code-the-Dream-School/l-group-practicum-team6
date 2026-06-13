import { useEffect } from 'react';

import { queryClient } from '../lib/queryClient';
import {
  fetchVisualizerDetail,
  type PlayerVisual,
  type VisualizerDetail,
} from '../queries/visualizerDetail';
import { visualizerQueryKeys } from '../queries/visualizerKeys';
import { useVisualizerQuery } from './useVisualizerQuery';

export type { PlayerVisual };

export function getCachedVisualizerGlsl(id: string, isDemo = false): string | null {
  return (
    queryClient.getQueryData<VisualizerDetail>(visualizerQueryKeys.detail(id, isDemo))?.glsl ?? null
  );
}

export function getCachedPlayerVisual(id: string, isDemo = false): PlayerVisual | null {
  return (
    queryClient.getQueryData<VisualizerDetail>(visualizerQueryKeys.detail(id, isDemo))?.visual ??
    null
  );
}

export function cacheVisualizerGlsl(id: string, glsl: string, isDemo = false): void {
  const queryKey = visualizerQueryKeys.detail(id, isDemo);
  const existing = queryClient.getQueryData<VisualizerDetail>(queryKey);

  queryClient.setQueryData<VisualizerDetail>(queryKey, {
    glsl,
    visual: existing?.visual ?? {
      id,
      name: '',
      tags: [],
      isDemo,
    },
  });
}

export async function loadVisualizer(id: string, isDemo = false): Promise<VisualizerDetail> {
  return queryClient.ensureQueryData({
    queryKey: visualizerQueryKeys.detail(id, isDemo),
    queryFn: () => fetchVisualizerDetail(id, isDemo),
  });
}

export async function loadVisualizerGlsl(id: string, isDemo = false): Promise<string> {
  const { glsl } = await loadVisualizer(id, isDemo);
  return glsl;
}

type PreviewGlslOptions = {
  enabled: boolean;
  previewGlsl?: string;
  isDemo?: boolean;
};

export function usePreviewGlsl(
  id: string,
  { enabled, previewGlsl, isDemo = false }: PreviewGlslOptions
): string | null {
  useEffect(() => {
    if (previewGlsl) {
      cacheVisualizerGlsl(id, previewGlsl, isDemo);
    }
  }, [previewGlsl, id, isDemo]);

  const { data } = useVisualizerQuery(id, {
    isDemo,
    enabled: enabled && !previewGlsl,
  });

  return previewGlsl ?? data?.glsl ?? null;
}

export function clearPreviewGlslCache() {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] === 'visualizers' && query.queryKey[1] === 'detail',
  });
}
