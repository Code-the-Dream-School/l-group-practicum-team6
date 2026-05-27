import { useCallback, useEffect, useRef, useState } from 'react';

import NavBar from './NavBar';
import PlayerControlBar from './player/PlayerControlBar';
import VisualInfoCard from './player/VisualInfoCard';
import { useToast } from '../context/useToast';
import { useFullscreen } from '../hooks/useFullscreen';
import type { PlayerVisual } from '../hooks/usePlayerVisualizer';
import { useAudioAnalyzer, type AudioAnalyzerStatus } from '../hooks/useAudioAnalyzer';
import { shouldHandlePlayerShortcut } from '../utils/playerKeyboard';
import { startVisualPreview } from '../utils/visualPreview';

type VisualizerPlayerProps = {
  glsl: string;
  visual: PlayerVisual;
};

export function VisualizerPlayer({ glsl, visual }: VisualizerPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastToastStatusRef = useRef<AudioAnalyzerStatus | null>(null);
  const toast = useToast();
  const { getAudioData, status, isMicEnabled, toggleMic } = useAudioAnalyzer();
  const {
    targetRef: playerRootRef,
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLDivElement>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleToggleFullscreen = useCallback(async () => {
    const didToggle = await toggleFullscreen();

    if (!didToggle) {
      toast.error('Fullscreen is not available in this browser.');
    }
  }, [toggleFullscreen, toast]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!shouldHandlePlayerShortcut(event)) {
        // skip binder and control
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'f') {
        event.preventDefault();
        void handleToggleFullscreen();
        return;
      }

      if (key === 'm') {
        event.preventDefault();
        toggleMic();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleToggleFullscreen, toggleMic]);

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
    <div ref={playerRootRef} className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
      {!isFullscreen && (
        <>
          <VisualInfoCard name={visual.name} tags={visual.tags} />
          <PlayerControlBar
            deviceLabel="Microphone — Built-in"
            isPlaying={isPlaying}
            isFavorited={isFavorited}
            isMicEnabled={isMicEnabled}
            showFavorite={!visual.isDemo}
            showPlaybackControls={!visual.isDemo}
            onTogglePlay={() => setIsPlaying((value) => !value)}
            onToggleFavorite={() => setIsFavorited((value) => !value)}
            onFullscreen={() => void handleToggleFullscreen()}
            onDeviceSelect={toggleMic}
          />
        </>
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
