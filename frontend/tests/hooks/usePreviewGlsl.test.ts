import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearPreviewGlslCache,
  getCachedVisualizerGlsl,
  loadVisualizerGlsl,
  usePreviewGlsl,
} from '../../src/hooks/usePreviewGlsl';

const getVisualizer = vi.fn();
const getDemoVisualizer = vi.fn();

vi.mock('../../src/api', () => ({
  getVisualizer: (...args: unknown[]) => getVisualizer(...args),
  getDemoVisualizer: (...args: unknown[]) => getDemoVisualizer(...args),
}));

describe('usePreviewGlsl', () => {
  afterEach(() => {
    clearPreviewGlslCache();
    getVisualizer.mockReset();
    getDemoVisualizer.mockReset();
  });

  it('fetches once and reuses cached glsl on later hovers', async () => {
    getVisualizer.mockResolvedValue({
      data: {
        _id: 'visual-1',
        name: 'Test',
        glsl: 'shader body',
        source: '',
        isDemo: false,
      },
    });

    const { rerender } = renderHook(({ enabled }) => usePreviewGlsl('visual-1', { enabled }), {
      initialProps: { enabled: true },
    });

    await waitFor(() => {
      expect(getVisualizer).toHaveBeenCalledTimes(1);
    });

    rerender({ enabled: false });
    rerender({ enabled: true });

    await waitFor(() => {
      expect(getVisualizer).toHaveBeenCalledTimes(1);
    });
  });

  it('uses previewGlsl prop without fetching', async () => {
    renderHook(() =>
      usePreviewGlsl('visual-1', {
        enabled: true,
        previewGlsl: 'inline shader',
      })
    );

    await waitFor(() => {
      expect(getVisualizer).not.toHaveBeenCalled();
    });
  });

  it('loadVisualizerGlsl returns cached glsl without a network call', async () => {
    getVisualizer.mockResolvedValue({
      data: {
        _id: 'visual-1',
        name: 'Test',
        glsl: 'shader body',
        source: '',
        isDemo: false,
      },
    });

    await loadVisualizerGlsl('visual-1');
    getVisualizer.mockClear();

    const cached = getCachedVisualizerGlsl('visual-1');
    expect(cached).toBe('shader body');

    await loadVisualizerGlsl('visual-1');
    expect(getVisualizer).not.toHaveBeenCalled();
  });
});
