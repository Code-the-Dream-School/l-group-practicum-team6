import { visualizerQueryKeys } from '../queries/visualizerKeys';
import { queryClient } from './queryClient';

export function clearSavedVisualsCache() {
  queryClient.removeQueries({ queryKey: visualizerQueryKeys.saved() });
}
