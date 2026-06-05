import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { QueryClientTestProvider } from '../../src/test/queryClient';

const getSavedVisuals = vi.fn();

vi.mock('../../src/api/users', () => ({
  getSavedVisuals: (...args: unknown[]) => getSavedVisuals(...args),
}));

import { useSavedVisualsQuery } from '../../src/hooks/useSavedVisualsQuery';

describe('useSavedVisualsQuery', () => {
  beforeEach(() => {
    queryClient.clear();
    getSavedVisuals.mockReset();
    getSavedVisuals.mockResolvedValue({
      data: [
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
      ],
    });
  });

  it('fetches saved visuals for the current user', async () => {
    const { result } = renderHook(() => useSavedVisualsQuery(), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].visualizerId._id).toBe('visual-1');
    expect(getSavedVisuals).toHaveBeenCalledTimes(1);
  });

  it('does not fetch when disabled', async () => {
    renderHook(() => useSavedVisualsQuery({ enabled: false }), {
      wrapper: QueryClientTestProvider,
    });

    await waitFor(() => {
      expect(getSavedVisuals).not.toHaveBeenCalled();
    });
  });
});
