import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAudioAnalyzer } from '../../src/hooks/useAudioAnalyzer';

type MockTrack = {
  enabled: boolean;
  stop: ReturnType<typeof vi.fn>;
  getSettings: () => { deviceId: string };
};

const createMockTrack = (): MockTrack => ({
  enabled: true,
  stop: vi.fn(),
  getSettings: () => ({ deviceId: 'default-device' }),
});

const createMockStream = (track = createMockTrack()) => ({
  getTracks: () => [track],
  getAudioTracks: () => [track],
});

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

const createMediaDevicesMock = (getUserMedia: ReturnType<typeof vi.fn>) => ({
  getUserMedia,
  enumerateDevices: vi.fn().mockResolvedValue([
    {
      kind: 'audioinput',
      deviceId: 'default-device',
      label: 'Default Microphone',
      groupId: 'default-group',
    },
  ]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

const createAudioContextMock = () => ({
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createMediaStreamSource: vi.fn(() => ({
    connect: vi.fn(),
  })),
  createAnalyser: vi.fn(() => ({
    fftSize: 0,
    smoothingTimeConstant: 0,
    getByteFrequencyData: vi.fn((buffer: Uint8Array) => {
      buffer.fill(7);
    }),
  })),
});

describe('useAudioAnalyzer', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'AudioContext',
      vi.fn(function MockAudioContext() {
        return createAudioContextMock();
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('moves from connecting to active when microphone access is granted', async () => {
    const stream = createMockStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: createMediaDevicesMock(getUserMedia),
    });

    const { result } = renderHook(() => useAudioAnalyzer());

    expect(result.current.status).toBe('connecting');

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('moves from connecting to denied when microphone access is rejected', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'));

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: createMediaDevicesMock(getUserMedia),
    });

    const { result } = renderHook(() => useAudioAnalyzer());

    expect(result.current.status).toBe('connecting');

    await waitFor(() => {
      expect(result.current.status).toBe('denied');
    });
  });

  it('returns zero audio data when microphone is disabled', async () => {
    const stream = createMockStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: createMediaDevicesMock(getUserMedia),
    });

    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    act(() => {
      result.current.toggleMic();
    });

    const audioData = result.current.getAudioData();

    expect(Array.from(audioData)).toEqual(new Array(128).fill(0));
  });

  it('stops audio tracks on unmount', async () => {
    const track = createMockTrack();
    const stream = createMockStream(track);
    const getUserMedia = vi.fn().mockResolvedValue(stream);

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: createMediaDevicesMock(getUserMedia),
    });

    const { result, unmount } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    unmount();

    expect(track.stop).toHaveBeenCalled();
  });

  it('stops a resolved stream if the hook unmounts before connection completes', async () => {
    const track = createMockTrack();
    const stream = createMockStream(track);
    const deferred = createDeferred<ReturnType<typeof createMockStream>>();
    const getUserMedia = vi.fn().mockReturnValue(deferred.promise);

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: createMediaDevicesMock(getUserMedia),
    });

    const { unmount } = renderHook(() => useAudioAnalyzer());

    unmount();

    await act(async () => {
      deferred.resolve(stream);
      await deferred.promise;
    });

    expect(track.stop).toHaveBeenCalled();
  });
});
