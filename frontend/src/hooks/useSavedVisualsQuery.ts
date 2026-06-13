import { useQuery } from '@tanstack/react-query';

import { fetchSavedVisuals, visualizerQueryKeys } from '../queries/savedVisuals';

type SavedVisualsOptions = {
  enabled?: boolean;
};

export function useSavedVisualsQuery({ enabled = true }: SavedVisualsOptions = {}) {
  return useQuery({
    queryKey: visualizerQueryKeys.saved(),
    queryFn: fetchSavedVisuals,
    enabled,
    retry: false,
  });
}
