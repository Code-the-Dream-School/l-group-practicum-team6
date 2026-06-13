import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryClientTestProvider } from '../../src/test/queryClient';

const getVisualizer = vi.fn();
const getDemoVisualizer = vi.fn();

vi.mock('../../src/api/visualizers', () => ({
  getVisualizer: (...args: unknown[]) => getVisualizer(...args),
  getDemoVisualizer: (...args: unknown[]) => getDemoVisualizer(...args),
}));

import { useVisualizerQuery } from '../../src/hooks/useVisualizerQuery';

describe('useVisualizerQuery', () => {
  beforeEach(() => {
    getVisualizer.mockReset();
    getDemoVisualizer.mockReset();
    getVisualizer.mockResolvedValue({
      data: {
        _id: 'visual-1',
        name: 'Pulse Waves',
        glsl: 'void main() {}',
        source: '',
        isDemo: false,
        tags: ['abstract'],
      },
    });
  });

  it('fetches a visualizer by id', async () => {
    const { result } = renderHook(() => useVisualizerQuery('visual-1'), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.glsl).toBe('void main() {}');
    expect(result.current.data?.visual.name).toBe('Pulse Waves');
    expect(getVisualizer).toHaveBeenCalledWith('visual-1');
  });

  it('keeps previous visualizer data while the next id is loading', async () => {
    let resolveSecond: ((value: unknown) => void) | undefined;

    getVisualizer.mockImplementation((id: string) => {
      if (id === 'visual-1') {
        return Promise.resolve({
          data: {
            _id: 'visual-1',
            name: 'Pulse Waves',
            glsl: 'shader-1',
            source: '',
            isDemo: false,
            tags: ['abstract'],
          },
        });
      }

      return new Promise((resolve) => {
        resolveSecond = resolve;
      });
    });

    const { result, rerender } = renderHook(({ activeId }) => useVisualizerQuery(activeId), {
      wrapper: QueryClientTestProvider,
      initialProps: { activeId: 'visual-1' },
    });

    await waitFor(() => {
      expect(result.current.data?.visual.id).toBe('visual-1');
    });

    rerender({ activeId: 'visual-2' });

    expect(result.current.data?.visual.id).toBe('visual-1');
    expect(result.current.isFetching).toBe(true);

    resolveSecond?.({
      data: {
        _id: 'visual-2',
        name: 'Wave Flow',
        glsl: 'shader-2',
        source: '',
        isDemo: false,
        tags: ['fluid'],
      },
    });

    await waitFor(() => {
      expect(result.current.data?.visual.id).toBe('visual-2');
    });
  });

  it('fetches the demo visualizer when isDemo is true', async () => {
    getDemoVisualizer.mockResolvedValue({
      data: {
        _id: 'demo-1',
        name: 'Demo',
        glsl: 'demo shader',
        source: '',
        isDemo: true,
        tags: [],
      },
    });

    const { result } = renderHook(() => useVisualizerQuery('demo', { isDemo: true }), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.glsl).toBe('demo shader');
    expect(getDemoVisualizer).toHaveBeenCalledTimes(1);
    expect(getVisualizer).not.toHaveBeenCalled();
  });
});
