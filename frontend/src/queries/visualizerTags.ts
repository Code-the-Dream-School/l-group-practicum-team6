import { getVisualizerTags } from '../api/visualizers';
import { visualizerQueryKeys } from './visualizerKeys';

export { visualizerQueryKeys };

export async function fetchVisualizerTags(): Promise<string[]> {
  const response = await getVisualizerTags();
  return response.data.map((tag) => tag.toLowerCase());
}
