import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

import {
  formatDeviceLabel,
  isTabCaptureDevice,
  mapAudioInputs,
  TAB_CAPTURE_DEVICE_ID,
  TAB_CAPTURE_LABEL,
  type AudioInputDevice,
} from '../utils/audioDevices';

const FFT_SIZE = 256;
const FREQUENCY_BIN_COUNT = FFT_SIZE / 2;

export type AudioAnalyzerStatus = 'idle' | 'connecting' | 'active' | 'denied' | 'error' | 'ended';

export type { AudioInputDevice };
export { formatDeviceLabel };

function teardown(
  streamRef: MutableRefObject<MediaStream | null>,
  audioContextRef: MutableRefObject<AudioContext | null>,
  analyserRef: MutableRefObject<AnalyserNode | null>
) {
  analyserRef.current = null;
  streamRef.current?.getTracks().forEach((track) => track.stop());
  streamRef.current = null;

  const audioContext = audioContextRef.current;
  audioContextRef.current = null;
  if (audioContext) {
    void audioContext.close();
  }
}

async function acquireStream(deviceId?: string): Promise<MediaStream> {
  if (deviceId && isTabCaptureDevice(deviceId)) {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Display media is not available');
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    });

    stream.getVideoTracks().forEach((track) => track.stop());

    if (stream.getAudioTracks().length === 0) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error('No audio tracks in display media stream');
    }

    return stream;
  }

  return navigator.mediaDevices.getUserMedia({
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
  });
}

function setupAnalyser(stream: MediaStream): {
  audioContext: AudioContext;
  analyser: AnalyserNode;
} {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();

  analyser.fftSize = FFT_SIZE;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  return { audioContext, analyser };
}

export function useAudioAnalyzer() {
  const [status, setStatus] = useState<AudioAnalyzerStatus>('idle');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef(new Uint8Array(FREQUENCY_BIN_COUNT));
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMicEnabledRef = useRef(isMicEnabled);
  const connectGenerationRef = useRef(0);
  const connectRef = useRef<(deviceId?: string) => Promise<void>>(async () => {});
  const lastMicDeviceIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    isMicEnabledRef.current = isMicEnabled;
  }, [isMicEnabled]);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    const allDevices = await navigator.mediaDevices.enumerateDevices();
    setDevices(mapAudioInputs(allDevices));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function connect(deviceId?: string) {
      const generation = ++connectGenerationRef.current;
      const isTabCapture = deviceId !== undefined && isTabCaptureDevice(deviceId);

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        return;
      }

      if (isTabCapture && !navigator.mediaDevices.getDisplayMedia) {
        setStatus('error');
        return;
      }

      teardown(streamRef, audioContextRef, analyserRef);
      setStatus('connecting');

      try {
        const stream = await acquireStream(deviceId);

        if (cancelled || generation !== connectGenerationRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const { audioContext, analyser } = setupAnalyser(stream);

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        stream.getAudioTracks().forEach((track) => {
          track.enabled = isMicEnabledRef.current;

          if (isTabCapture) {
            track.onended = () => {
              if (generation !== connectGenerationRef.current) {
                return;
              }

              setStatus('ended');
              void connectRef.current(lastMicDeviceIdRef.current);
            };
          }
        });

        streamRef.current = stream;
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        if (isTabCapture) {
          setSelectedDeviceId(TAB_CAPTURE_DEVICE_ID);
        } else if (deviceId) {
          lastMicDeviceIdRef.current = deviceId;
          setSelectedDeviceId(deviceId);
        } else {
          const activeDeviceId = stream.getAudioTracks()[0]?.getSettings().deviceId ?? '';
          if (activeDeviceId) {
            lastMicDeviceIdRef.current = activeDeviceId;
            setSelectedDeviceId(activeDeviceId);
          }
        }

        await refreshDevices();
        setStatus('active');
      } catch {
        if (cancelled) {
          return;
        }

        if (isTabCapture) {
          setStatus('denied');
          void connectRef.current(lastMicDeviceIdRef.current);
          return;
        }

        setStatus('denied');
      }
    }

    connectRef.current = connect;
    void connect();

    const onDeviceChange = () => {
      void refreshDevices();
    };

    navigator.mediaDevices?.addEventListener('devicechange', onDeviceChange);

    return () => {
      cancelled = true;
      navigator.mediaDevices?.removeEventListener('devicechange', onDeviceChange);
      teardown(streamRef, audioContextRef, analyserRef);
    };
  }, [refreshDevices]);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    void connectRef.current(deviceId);
  }, []);

  const toggleMic = useCallback(() => {
    setIsMicEnabled((enabled) => {
      const nextEnabled = !enabled;

      streamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = nextEnabled;
      });

      return nextEnabled;
    });
  }, []);

  const getAudioData = useCallback((): Uint8Array => {
    const analyser = analyserRef.current;
    const buffer = bufferRef.current;

    if (!isMicEnabled || !analyser) {
      buffer.fill(0);
      return buffer;
    }

    analyser.getByteFrequencyData(buffer);
    return buffer;
  }, [isMicEnabled]);

  const selectedDevice =
    devices.find((device) => device.deviceId === selectedDeviceId) ?? devices[0];
  const selectedDeviceLabel = isTabCaptureDevice(selectedDeviceId)
    ? formatDeviceLabel(TAB_CAPTURE_LABEL)
    : formatDeviceLabel(selectedDevice?.label ?? 'Microphone');

  return {
    getAudioData,
    status,
    isMicEnabled,
    toggleMic,
    devices,
    selectedDeviceId,
    selectedDeviceLabel,
    selectDevice,
  };
}
