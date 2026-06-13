import { useQuery } from '@tanstack/react-query';

import { fetchVisualizerTags, visualizerQueryKeys } from '../queries/visualizerTags';

export function useVisualizerTagsQuery() {
  return useQuery({
    queryKey: visualizerQueryKeys.tags(),
    queryFn: fetchVisualizerTags,
  });
}
