import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { QueryClientTestProvider } from '../../src/test/queryClient';

const getSavedVisuals = vi.fn();
const saveVisual = vi.fn();
const removeVisual = vi.fn();
const toast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

vi.mock('../../src/api/users', () => ({
  getSavedVisuals: (...args: unknown[]) => getSavedVisuals(...args),
}));

vi.mock('../../src/api', () => ({
  saveVisual: (...args: unknown[]) => saveVisual(...args),
  removeVisual: (...args: unknown[]) => removeVisual(...args),
}));

vi.mock('../../src/context/useToast', () => ({
  useToast: () => toast,
}));

import { useFavoriteVisual } from '../../src/hooks/useFavoriteVisual';

describe('useFavoriteVisual', () => {
  beforeEach(() => {
    queryClient.clear();
    getSavedVisuals.mockReset();
    saveVisual.mockReset();
    removeVisual.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();

    getSavedVisuals.mockResolvedValue({
      data: [
        {
          _id: 'saved-1',
          userId: 'user-1',
          visualizerId: { _id: 'visual-1', name: 'Aurora', source: '', glsl: '', isDemo: false },
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    saveVisual.mockResolvedValue({ data: {} });
    removeVisual.mockResolvedValue({ msg: 'removed' });
  });

  it('loads whether the visual is favorited', async () => {
    const { result } = renderHook(() => useFavoriteVisual('visual-1'), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isFavorited).toBe(true);
  });

  it('saves a visual when toggled on', async () => {
    getSavedVisuals.mockResolvedValueOnce({ data: [] }).mockResolvedValue({
      data: [
        {
          _id: 'saved-2',
          userId: 'user-1',
          visualizerId: { _id: 'visual-2', name: 'Wave', source: '', glsl: '', isDemo: false },
          createdAt: '',
          updatedAt: '',
        },
      ],
    });

    const { result } = renderHook(() => useFavoriteVisual('visual-2'), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(saveVisual).toHaveBeenCalledWith('visual-2', expect.anything());

    await waitFor(() => {
      expect(result.current.isFavorited).toBe(true);
    });
    expect(toast.success).toHaveBeenCalledWith('Visualizer saved to favorites.');
  });

  it('removes a visual when toggled off', async () => {
    getSavedVisuals.mockReset();
    getSavedVisuals
      .mockResolvedValueOnce({
        data: [
          {
            _id: 'saved-1',
            userId: 'user-1',
            visualizerId: { _id: 'visual-1', name: 'Aurora', source: '', glsl: '', isDemo: false },
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
      .mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useFavoriteVisual('visual-1'), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isFavorited).toBe(true);
    });

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(removeVisual).toHaveBeenCalledWith('visual-1', expect.anything());

    await waitFor(() => {
      expect(result.current.isFavorited).toBe(false);
    });
    expect(toast.success).toHaveBeenCalledWith('Visualizer removed from favorites.');
  });

  it('rolls back when the API call fails', async () => {
    getSavedVisuals.mockResolvedValue({ data: [] });
    saveVisual.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useFavoriteVisual('visual-2'), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.toggleFavorite();
      } catch {
        // mutateAsync rejects when save fails
      }
    });

    expect(result.current.isFavorited).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });
});
