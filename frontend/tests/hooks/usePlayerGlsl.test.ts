import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { QueryClientTestProvider } from '../../src/test/queryClient';
import { cacheVisualizerGlsl, clearPreviewGlslCache } from '../../src/hooks/usePreviewGlsl';
import { usePlayerGlsl } from '../../src/hooks/usePlayerGlsl';

const getVisualizer = vi.fn();

vi.mock('../../src/api/visualizers', () => ({
  getVisualizer: (...args: unknown[]) => getVisualizer(...args),
  getDemoVisualizer: vi.fn(),
}));

describe('usePlayerGlsl', () => {
  afterEach(() => {
    queryClient.clear();
    clearPreviewGlslCache();
    getVisualizer.mockReset();
  });

  it('skips loading state when glsl is already cached from preview', async () => {
    cacheVisualizerGlsl('visual-1', 'cached shader');

    const { result } = renderHook(() => usePlayerGlsl('visual-1'), {
      wrapper: QueryClientTestProvider,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.glsl).toBe('cached shader');

    await waitFor(() => {
      expect(getVisualizer).not.toHaveBeenCalled();
    });
  });
});
