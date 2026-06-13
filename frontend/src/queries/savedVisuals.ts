import { getSavedVisuals, type SavedVisual } from '../api/users';
import { visualizerQueryKeys } from './visualizerKeys';

export { visualizerQueryKeys };

export async function fetchSavedVisuals(): Promise<SavedVisual[]> {
  const response = await getSavedVisuals();
  return response.data;
}
