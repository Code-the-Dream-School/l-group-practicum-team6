import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getByteFrequencyData = vi.fn();
const trackStop = vi.fn();
const connect = vi.fn();
const close = vi.fn();
const resume = vi.fn().mockResolvedValue(undefined);

function createAnalyser() {
  return {
    fftSize: 256,
    smoothingTimeConstant: 0.8,
    getByteFrequencyData,
  };
}

class MockAudioContext {
  state = 'running';
  resume = resume;
  createMediaStreamSource = vi.fn(() => ({ connect }));
  createAnalyser = vi.fn(createAnalyser);
  close = close;

  constructor() {}
}

describe('useAudioAnalyzer', () => {
  beforeEach(() => {
    vi.resetModules();
    getByteFrequencyData.mockReset();
    trackStop.mockReset();
    connect.mockReset();
    close.mockReset();
    resume.mockClear();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: trackStop }],
        }),
      },
    });

    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('connects to the microphone and exposes active status', async () => {
    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('returns zeroed audio data before the analyser is ready', async () => {
    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    const data = result.current.getAudioData();

    expect(Array.from(data)).toEqual(Array(data.length).fill(0));
  });

  it('reads frequency data when the analyser is active', async () => {
    getByteFrequencyData.mockImplementation((buffer: Uint8Array) => {
      buffer[0] = 42;
    });

    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    const data = result.current.getAudioData();

    expect(getByteFrequencyData).toHaveBeenCalled();
    expect(data[0]).toBe(42);
  });

  it('marks permission as denied when microphone access fails', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(new Error('denied'));

    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('denied');
    });
  });

  it('reports an error when media devices are unavailable', async () => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    });

    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });

  it('cleans up media tracks and audio context on unmount', async () => {
    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result, unmount } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    unmount();

    expect(trackStop).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });
});
