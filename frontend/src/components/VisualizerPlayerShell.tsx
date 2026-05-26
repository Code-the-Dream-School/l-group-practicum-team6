import { useEffect, useRef } from 'react';

import NavBar from './NavBar';
import { useToast } from '../context/useToast';
import { useAudioAnalyzer, type AudioAnalyzerStatus } from '../hooks/useAudioAnalyzer';
import { startVisualPreview } from '../utils/visualPreview';

export function VisualizerPlayer({ glsl }: { glsl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastToastStatusRef = useRef<AudioAnalyzerStatus | null>(null);
  const toast = useToast();
  const { getAudioData, status } = useAudioAnalyzer();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return startVisualPreview(container, glsl, getAudioData, true);
  }, [glsl, getAudioData]);

  useEffect(() => {
    if (status === lastToastStatusRef.current) return;

    lastToastStatusRef.current = status;

    if (status === 'connecting') {
      toast.info('Connecting microphone...');
      return;
    }

    if (status === 'denied') {
      toast.error('Microphone access was blocked. Enable it in browser settings.');
      return;
    }

    if (status === 'error') {
      toast.error('Audio input is not available in this browser.');
    }
  }, [status, toast]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
    </div>
  );
}

export function PlayerMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <p className="max-w-md text-center text-sm text-white/70">{children}</p>
    </div>
  );
}

export function VisualizerPlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black">
      <NavBar />
      <div className="relative min-h-0 w-full flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
