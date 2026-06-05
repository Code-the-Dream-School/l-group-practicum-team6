import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { QueryClientTestProvider } from '../../src/test/queryClient';
import { clearPreviewGlslCache, loadVisualizerGlsl } from '../../src/hooks/usePreviewGlsl';
import { usePlayerVisualizer } from '../../src/hooks/usePlayerVisualizer';

const getVisualizer = vi.fn();

vi.mock('../../src/api/visualizers', () => ({
  getVisualizer: (...args: unknown[]) => getVisualizer(...args),
  getDemoVisualizer: vi.fn(),
}));

describe('usePlayerVisualizer', () => {
  afterEach(() => {
    queryClient.clear();
    clearPreviewGlslCache();
    getVisualizer.mockReset();
  });

  it('skips a second network call when glsl was cached from card preview', async () => {
    getVisualizer.mockResolvedValue({
      data: {
        _id: 'visual-1',
        name: 'Pulse Waves',
        glsl: 'cached shader',
        source: '',
        isDemo: false,
        tags: ['abstract'],
      },
    });

    await loadVisualizerGlsl('visual-1');
    getVisualizer.mockClear();

    const { result } = renderHook(() => usePlayerVisualizer('visual-1'), {
      wrapper: QueryClientTestProvider,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.glsl).toBe('cached shader');
    expect(result.current.visual?.name).toBe('Pulse Waves');

    await waitFor(() => {
      expect(getVisualizer).not.toHaveBeenCalled();
    });
  });
});
