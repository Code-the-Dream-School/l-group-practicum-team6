import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PLAYER_CONTROLS_HIDE_MS,
  usePlayerControlsVisibility,
} from '../../src/hooks/usePlayerControlsVisibility';

describe('usePlayerControlsVisibility', () => {
  let root: HTMLDivElement;
  const rootRef = { current: null as HTMLDivElement | null };

  beforeEach(() => {
    vi.useFakeTimers();
    root = document.createElement('div');
    document.body.appendChild(root);
    rootRef.current = root;
  });

  afterEach(() => {
    vi.useRealTimers();
    root.remove();
    rootRef.current = null;
  });

  it('hides controls after 3 seconds without pointer activity when mic is active', () => {
    const { result } = renderHook(() => usePlayerControlsVisibility(rootRef, 'active'));

    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS);
    });

    expect(result.current).toBe(false);
  });

  it('shows controls again on pointer activity', () => {
    const { result } = renderHook(() => usePlayerControlsVisibility(rootRef, 'active'));

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS);
    });

    expect(result.current).toBe(false);

    act(() => {
      root.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    });

    expect(result.current).toBe(true);
  });

  it('keeps controls visible when mic state is idle', () => {
    const { result } = renderHook(() => usePlayerControlsVisibility(rootRef, 'idle'));

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS + 1000);
    });

    expect(result.current).toBe(true);
  });

  it('keeps controls visible when mic state is denied', () => {
    const { result } = renderHook(() => usePlayerControlsVisibility(rootRef, 'denied'));

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS + 1000);
    });

    expect(result.current).toBe(true);
  });

  it('keeps controls visible when disabled', () => {
    const { result } = renderHook(() => usePlayerControlsVisibility(rootRef, 'active', false));

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS + 1000);
    });

    expect(result.current).toBe(true);
  });
});
