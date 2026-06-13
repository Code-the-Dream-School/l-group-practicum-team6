import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchVisualizerDetail, visualizerQueryKeys } from '../queries/visualizerDetail';

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
    staleTime: 5 * 60000,
    placeholderData: keepPreviousData,
  });
}
