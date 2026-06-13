import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryClientTestProvider } from '../../src/test/queryClient';

const listVisualizers = vi.fn();

vi.mock('../../src/api/visualizers', () => ({
  listVisualizers: (...args: unknown[]) => listVisualizers(...args),
}));

import { useVisualizerListQuery } from '../../src/hooks/useVisualizerListQuery';

const defaultFilters = {
  page: 1,
  limit: 8,
} as const;

describe('useVisualizerListQuery', () => {
  beforeEach(() => {
    listVisualizers.mockReset();
    listVisualizers.mockResolvedValue({
      data: [{ _id: 'visual-1', name: 'Pulse Waves', isDemo: false }],
      total: 1,
      page: 1,
      pages: 1,
    });
  });

  it('fetches paginated visualizers for the explore grid', async () => {
    const { result } = renderHook(() => useVisualizerListQuery(defaultFilters), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.visuals).toHaveLength(1);
    expect(result.current.data?.totalPages).toBe(1);
    expect(listVisualizers).toHaveBeenCalledWith({
      page: 1,
      limit: 8,
      search: undefined,
      tag: undefined,
    });
  });

  it('uses separate cache entries for different filters', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientTestProvider>{children}</QueryClientTestProvider>
    );

    const first = renderHook(
      () =>
        useVisualizerListQuery({
          page: 1,
          limit: 8,
          search: 'wave',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(first.result.current.isSuccess).toBe(true);
    });

    first.unmount();

    renderHook(
      () =>
        useVisualizerListQuery({
          page: 1,
          limit: 8,
          tag: 'abstract',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(listVisualizers).toHaveBeenCalledTimes(2);
    });

    expect(listVisualizers).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 8,
      search: 'wave',
      tag: undefined,
    });
    expect(listVisualizers).toHaveBeenNthCalledWith(2, {
      page: 1,
      limit: 8,
      search: undefined,
      tag: 'abstract',
    });
  });
});
