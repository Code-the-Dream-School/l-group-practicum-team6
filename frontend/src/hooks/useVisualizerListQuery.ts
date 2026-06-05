import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  fetchVisualizerList,
  type VisualizerListFilters,
  visualizerQueryKeys,
} from '../queries/visualizerList';

export function useVisualizerListQuery(filters: VisualizerListFilters) {
  return useQuery({
    queryKey: visualizerQueryKeys.list(filters),
    queryFn: () => fetchVisualizerList(filters),
    placeholderData: keepPreviousData,
  });
}
