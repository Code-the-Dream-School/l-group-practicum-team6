import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  fetchVisualizerList,
  type VisualizerFilters,
  visualizerQueryKeys,
} from '../queries/visualizerList';

export function useVisualizerListQuery(
  filters: VisualizerFilters,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: visualizerQueryKeys.list(filters),
    queryFn: () => fetchVisualizerList(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}
