import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFullscreen } from '../../src/hooks/useFullscreen';

describe('useFullscreen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests fullscreen on the target element', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());

    const element = document.createElement('div');
    element.requestFullscreen = requestFullscreen;
    result.current.targetRef.current = element;

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      writable: true,
      value: null,
    });

    await act(async () => {
      const didToggle = await result.current.toggleFullscreen();
      expect(didToggle).toBe(true);
    });

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('exits fullscreen when the target is already fullscreen', async () => {
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());

    const element = document.createElement('div');
    element.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    result.current.targetRef.current = element;

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      writable: true,
      value: element,
    });

    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });

    await act(async () => {
      const didToggle = await result.current.toggleFullscreen();
      expect(didToggle).toBe(true);
    });

    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it('returns false when fullscreen is not supported', async () => {
    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());

    result.current.targetRef.current = document.createElement('div');

    await act(async () => {
      const didToggle = await result.current.toggleFullscreen();
      expect(didToggle).toBe(false);
    });
  });
});
