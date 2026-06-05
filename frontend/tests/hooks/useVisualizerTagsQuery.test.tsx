import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '../../src/test/createTestQueryClient';
import { QueryClientTestProvider } from '../../src/test/queryClient';

const getVisualizerTags = vi.fn();

vi.mock('../../src/api/visualizers', () => ({
  getVisualizerTags: (...args: unknown[]) => getVisualizerTags(...args),
}));

import { useVisualizerTagsQuery } from '../../src/hooks/useVisualizerTagsQuery';

describe('useVisualizerTagsQuery', () => {
  beforeEach(() => {
    getVisualizerTags.mockReset();
    getVisualizerTags.mockResolvedValue({
      data: ['Geometric', 'Audio'],
    });
  });

  it('fetches and normalizes visualizer tags', async () => {
    const { result } = renderHook(() => useVisualizerTagsQuery(), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(['geometric', 'audio']);
    expect(getVisualizerTags).toHaveBeenCalledTimes(1);
  });

  it('does not refetch tags while data is still fresh', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientTestProvider client={queryClient}>{children}</QueryClientTestProvider>
    );

    const { result, rerender } = renderHook(() => useVisualizerTagsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    rerender();

    expect(getVisualizerTags).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(['geometric', 'audio']);
  });
});
