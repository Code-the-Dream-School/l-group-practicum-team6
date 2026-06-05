import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { QueryClientTestProvider } from '../../src/test/queryClient';
import { setPlaybackContext } from '../../src/queries/playbackContext';
import { visualizerQueryKeys } from '../../src/queries/visualizerKeys';

const listVisualizers = vi.fn();

vi.mock('../../src/api/visualizers', () => ({
  listVisualizers: (...args: unknown[]) => listVisualizers(...args),
}));

import { useVisualizerPlayback } from '../../src/hooks/useVisualizerPlayback';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function createWrapper(initialPath = '/visualizer/b') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientTestProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route
              path="/visualizer/:id"
              element={
                <>
                  {children}
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientTestProvider>
    );
  };
}

describe('useVisualizerPlayback', () => {
  beforeEach(() => {
    queryClient.clear();
    listVisualizers.mockReset();
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

  afterEach(() => {
    queryClient.clear();
  });

  async function waitForExploreList(page: number) {
    await waitFor(() => {
      expect(queryClient.getQueryData(visualizerQueryKeys.list({ page, limit: 8 }))).toBeTruthy();
    });
  }

  it('navigates to the previous visual on the same explore page', async () => {
    setPlaybackContext({
      source: 'explore',
      filters: { page: 1, limit: 8 },
    });

    const { result } = renderHook(() => useVisualizerPlayback('b'), {
      wrapper: createWrapper('/visualizer/b'),
    });

    await waitForExploreList(1);

    act(() => {
      result.current.goPrevious();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')?.textContent).toBe('/visualizer/a');
    });
  });

  it('fetches the next explore page when moving past the last visual', async () => {
    setPlaybackContext({
      source: 'explore',
      filters: { page: 1, limit: 8 },
    });

    const { result } = renderHook(() => useVisualizerPlayback('b'), {
      wrapper: createWrapper('/visualizer/b'),
    });

    await waitForExploreList(1);

    act(() => {
      result.current.goNext();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')?.textContent).toBe('/visualizer/c');
    });

    expect(listVisualizers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 8,
      })
    );
  });

  it('loops from the last visual back to the first page', async () => {
    setPlaybackContext({
      source: 'explore',
      filters: { page: 2, limit: 8 },
    });

    const { result } = renderHook(() => useVisualizerPlayback('c'), {
      wrapper: createWrapper('/visualizer/c'),
    });

    await waitForExploreList(2);

    act(() => {
      result.current.goNext();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')?.textContent).toBe('/visualizer/a');
    });

    expect(listVisualizers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 8,
      })
    );
  });

  it('loops from the first visual to the last page when going previous', async () => {
    setPlaybackContext({
      source: 'explore',
      filters: { page: 1, limit: 8 },
    });

    const { result } = renderHook(() => useVisualizerPlayback('a'), {
      wrapper: createWrapper('/visualizer/a'),
    });

    await waitForExploreList(1);

    act(() => {
      result.current.goPrevious();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')?.textContent).toBe('/visualizer/c');
    });

    expect(listVisualizers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 8,
      })
    );
  });

  it('loops to the first visual when the current id is not in the active playlist', async () => {
    const { result } = renderHook(() => useVisualizerPlayback('missing'), {
      wrapper: createWrapper('/visualizer/missing'),
    });

    await waitForExploreList(1);

    act(() => {
      result.current.goNext();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')?.textContent).toBe('/visualizer/a');
    });
  });
});
