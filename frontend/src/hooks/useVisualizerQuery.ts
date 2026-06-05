import { useQuery } from '@tanstack/react-query';

import { fetchVisualizerDetail, visualizerQueryKeys } from '../queries/visualizerDetail';

const VISUALIZER_DETAIL_STALE_MS = 5 * 60_000;

export type VisualizerOptions = {
  isDemo?: boolean;
  enabled?: boolean;
};

export function useVisualizerQuery(
  id: string,
  { isDemo = false, enabled = true }: VisualizerOptions = {}
) {
  return useQuery({
    queryKey: visualizerQueryKeys.detail(id, isDemo),
    queryFn: () => fetchVisualizerDetail(id, isDemo),
    enabled: enabled && (isDemo || Boolean(id)),
    staleTime: VISUALIZER_DETAIL_STALE_MS,
  });
}
