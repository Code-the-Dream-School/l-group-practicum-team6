import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '../../src/test/createTestQueryClient';
import { visualizerQueryKeys } from '../../src/queries/visualizerKeys';

const getVisualizer = vi.fn();
const listVisualizers = vi.fn();

vi.mock('../../src/api/visualizers', () => ({
  getVisualizer: (...args: unknown[]) => getVisualizer(...args),
  getDemoVisualizer: vi.fn(),
  listVisualizers: (...args: unknown[]) => listVisualizers(...args),
}));

import { prefetchPlayback } from '../../src/queries/prefetchPlayback';

describe('prefetchPlayback', () => {
  beforeEach(() => {
    getVisualizer.mockReset();
    listVisualizers.mockReset();

    getVisualizer.mockImplementation(async (id: string) => ({
      data: {
        _id: id,
        name: `Visual ${id}`,
        glsl: `shader-${id}`,
        source: '',
        isDemo: false,
        tags: [],
      },
    }));

    listVisualizers.mockImplementation(async ({ page }: { page: number }) => ({
      data:
        page === 1
          ? [
              { _id: 'a', name: 'A', isDemo: false },
              { _id: 'b', name: 'B', isDemo: false },
            ]
          : [{ _id: 'c', name: 'C', isDemo: false }],
      total: 3,
      page,
      pages: 2,
    }));
  });

  it('prefetches same-page neighbors', async () => {
    const queryClient = createTestQueryClient();

    await prefetchPlayback({
      queryClient,
      idsOnPage: ['a', 'b', 'c'],
      currentIndex: 1,
      currentPage: 1,
      totalPages: 1,
      filters: { page: 1, limit: 8 },
    });

    await vi.waitFor(() => {
      expect(queryClient.getQueryData(visualizerQueryKeys.detail('a'))).toBeTruthy();
      expect(queryClient.getQueryData(visualizerQueryKeys.detail('c'))).toBeTruthy();
    });

    expect(getVisualizer).toHaveBeenCalledWith('a');
    expect(getVisualizer).toHaveBeenCalledWith('c');
    expect(listVisualizers).not.toHaveBeenCalled();
  });

  it('prefetches wrapped page list and boundary visual when at page edge', async () => {
    const queryClient = createTestQueryClient();

    await prefetchPlayback({
      queryClient,
      idsOnPage: ['a', 'b'],
      currentIndex: 1,
      currentPage: 1,
      totalPages: 2,
      filters: { page: 1, limit: 8 },
    });

    await vi.waitFor(() => {
      expect(queryClient.getQueryData(visualizerQueryKeys.detail('c'))).toBeTruthy();
      expect(
        queryClient.getQueryData(visualizerQueryKeys.list({ page: 2, limit: 8 }))
      ).toBeTruthy();
    });

    expect(listVisualizers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 8,
      })
    );
    expect(getVisualizer).toHaveBeenCalledWith('c');
  });
});
