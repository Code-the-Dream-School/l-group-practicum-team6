import { useEffect, useRef } from 'react';

import NavBar from './NavBar';
import { useAudioAnalyzer, type AudioAnalyzerStatus } from '../hooks/useAudioAnalyzer';
import { startVisualPreview } from '../utils/visualPreview';

function audioStatusMessage(status: AudioAnalyzerStatus): string | null {
  switch (status) {
    case 'connecting':
      return 'Connecting microphone…';
    case 'denied':
      return 'Microphone access was blocked. Enable it in browser settings to sync visuals to audio.';
    case 'error':
      return 'Audio input is not available in this browser.';
    default:
      return null;
  }
}

export function VisualizerPlayer({ glsl }: { glsl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getAudioData, status } = useAudioAnalyzer();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return startVisualPreview(container, glsl, getAudioData, true);
  }, [glsl, getAudioData]);

  const statusMessage = audioStatusMessage(status);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
      {statusMessage && (
        <p className="pointer-events-none absolute bottom-6 left-1/2 max-w-md -translate-x-1/2 rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-center text-sm text-white/80 backdrop-blur">
          {statusMessage}
        </p>
      )}
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
