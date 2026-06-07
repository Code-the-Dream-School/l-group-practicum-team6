import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TAB_CAPTURE_DEVICE_ID } from '../../src/utils/audioDevices';

const getByteFrequencyData = vi.fn();
const trackStop = vi.fn();
const videoTrackStop = vi.fn();
const connect = vi.fn();
const close = vi.fn();
const resume = vi.fn().mockResolvedValue(undefined);
const mockAudioTrack = {
  stop: trackStop,
  enabled: true,
  getSettings: () => ({ deviceId: 'builtin-mic' }),
};
const mockVideoTrack = {
  stop: videoTrackStop,
  enabled: true,
};
const mockDisplayAudioTrack = {
  stop: trackStop,
  enabled: true,
  onended: null as (() => void) | null,
  getSettings: () => ({}),
};

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
    videoTrackStop.mockReset();
    connect.mockReset();
    close.mockReset();
    resume.mockClear();
    mockAudioTrack.enabled = true;
    mockDisplayAudioTrack.onended = null;

    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [mockAudioTrack],
          getAudioTracks: () => [mockAudioTrack],
        }),
        getDisplayMedia: vi.fn().mockResolvedValue({
          getTracks: () => [mockVideoTrack, mockDisplayAudioTrack],
          getVideoTracks: () => [mockVideoTrack],
          getAudioTracks: () => [mockDisplayAudioTrack],
        }),
        enumerateDevices: vi.fn().mockResolvedValue([
          { kind: 'audioinput', deviceId: 'builtin-mic', label: 'Built-in Microphone' },
          { kind: 'audioinput', deviceId: 'usb-mic', label: 'USB Microphone' },
        ]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
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

  it('returns zeroed audio data when the microphone is toggled off', async () => {
    getByteFrequencyData.mockImplementation((buffer: Uint8Array) => {
      buffer[0] = 42;
    });

    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    result.current.toggleMic();

    await waitFor(() => {
      expect(result.current.isMicEnabled).toBe(false);
    });

    const data = result.current.getAudioData();

    expect(mockAudioTrack.enabled).toBe(false);
    expect(getByteFrequencyData).not.toHaveBeenCalled();
    expect(Array.from(data)).toEqual(Array(data.length).fill(0));
  });

  it('lists audio input devices after connecting', async () => {
    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(2);
    });

    expect(result.current.devices[0]).toEqual({
      deviceId: 'builtin-mic',
      label: 'Built-in Microphone',
    });
    expect(result.current.selectedDeviceId).toBe('builtin-mic');
  });

  it('switches to a selected microphone device', async () => {
    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    result.current.selectDevice('usb-mic');

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenLastCalledWith({
        audio: { deviceId: { exact: 'usb-mic' } },
      });
      expect(result.current.selectedDeviceId).toBe('usb-mic');
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

  it('connects to tab capture and stops video tracks', async () => {
    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    result.current.selectDevice(TAB_CAPTURE_DEVICE_ID);

    await waitFor(() => {
      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith({
        audio: true,
        video: true,
      });
      expect(videoTrackStop).toHaveBeenCalled();
      expect(result.current.selectedDeviceId).toBe(TAB_CAPTURE_DEVICE_ID);
      expect(result.current.status).toBe('active');
    });
  });

  it('falls back to the last microphone when tab capture is denied', async () => {
    vi.mocked(navigator.mediaDevices.getDisplayMedia).mockRejectedValueOnce(new Error('denied'));

    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    result.current.selectDevice(TAB_CAPTURE_DEVICE_ID);

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenLastCalledWith({
        audio: { deviceId: { exact: 'builtin-mic' } },
      });
      expect(result.current.selectedDeviceId).toBe('builtin-mic');
      expect(result.current.status).toBe('active');
    });
  });

  it('falls back to the last microphone when tab sharing ends', async () => {
    const { useAudioAnalyzer } = await import('../../src/hooks/useAudioAnalyzer');
    const { result } = renderHook(() => useAudioAnalyzer());

    await waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    result.current.selectDevice(TAB_CAPTURE_DEVICE_ID);

    await waitFor(() => {
      expect(result.current.selectedDeviceId).toBe(TAB_CAPTURE_DEVICE_ID);
    });

    mockDisplayAudioTrack.onended?.();

    await waitFor(() => {
      expect(result.current.status).toBe('active');
      expect(result.current.selectedDeviceId).toBe('builtin-mic');
    });
  });
});
