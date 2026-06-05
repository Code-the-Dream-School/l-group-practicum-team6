import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { visualizerQueryKeys } from '../../src/queries/visualizerKeys';

const getSavedVisuals = vi.fn();

vi.mock('../../src/api/users', () => ({
  getSavedVisuals: (...args: unknown[]) => getSavedVisuals(...args),
}));

import { clearSavedVisualsCache } from '../../src/lib/clearSavedVisualsCache';

describe('clearSavedVisualsCache', () => {
  beforeEach(() => {
    queryClient.clear();
    getSavedVisuals.mockReset();
  });

  it('removes cached saved visuals', async () => {
    queryClient.setQueryData(visualizerQueryKeys.saved(), [
      {
        _id: 'saved-1',
        userId: 'user-1',
        visualizerId: {
          _id: 'visual-1',
          name: 'Pulse Waves',
          source: '',
          glsl: '',
          isDemo: false,
        },
        createdAt: '',
        updatedAt: '',
      },
    ]);

    clearSavedVisualsCache();

    expect(queryClient.getQueryData(visualizerQueryKeys.saved())).toBeUndefined();
  });
});
