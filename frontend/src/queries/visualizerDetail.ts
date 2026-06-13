import type { Visualizer } from '@sonix/shared';

import { getDemoVisualizer, getVisualizer } from '../api/visualizers';
import { visualizerQueryKeys } from './visualizerKeys';

export { visualizerQueryKeys };

export type PlayerVisual = {
  id: string;
  name: string;
  tags: string[];
  isDemo?: boolean;
};

export type VisualizerDetail = {
  glsl: string;
  visual: PlayerVisual;
};

function toPlayerVisual(visualizer: Visualizer): PlayerVisual {
  return {
    id: visualizer._id,
    name: visualizer.name,
    tags: visualizer.tags ?? [],
    isDemo: visualizer.isDemo,
  };
}

export async function fetchVisualizerDetail(id: string, isDemo = false): Promise<VisualizerDetail> {
  const response = isDemo ? await getDemoVisualizer() : await getVisualizer(id);

  return {
    glsl: response.data.glsl,
    visual: toPlayerVisual(response.data),
  };
}
