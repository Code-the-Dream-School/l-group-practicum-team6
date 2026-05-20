import { useCallback, useEffect, useRef, useState } from 'react';

const FFT_SIZE = 256;
const FREQUENCY_BIN_COUNT = FFT_SIZE / 2;

export type AudioAnalyzerStatus = 'idle' | 'connecting' | 'active' | 'denied' | 'error';

export function useAudioAnalyzer() {
  const [status, setStatus] = useState<AudioAnalyzerStatus>('idle');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef(new Uint8Array(FREQUENCY_BIN_COUNT));
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        return;
      }

      setStatus('connecting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = FFT_SIZE;
        source.connect(analyser);

        streamRef.current = stream;
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        setStatus('active');
      } catch {
        if (!cancelled) {
          setStatus('denied');
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      analyserRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      const audioContext = audioContextRef.current;
      audioContextRef.current = null;
      if (audioContext) {
        void audioContext.close();
      }
    };
  }, []);

  const getAudioData = useCallback((): Uint8Array => {
    const analyser = analyserRef.current;
    const buffer = bufferRef.current;

    if (analyser) {
      analyser.getByteFrequencyData(buffer);
    } else {
      buffer.fill(0);
    }

    return buffer;
  }, []);

  return { getAudioData, status };
}
