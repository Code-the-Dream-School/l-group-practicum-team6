import { useCallback, useEffect, useRef, useState } from 'react';

import NavBar from './NavBar';
import PlayerControlBar from './player/PlayerControlBar';
import VisualInfoCard from './player/VisualInfoCard';
import { useToast } from '../context/useToast';
import { useFavoriteVisual } from '../hooks/useFavoriteVisual';
import { useFullscreen } from '../hooks/useFullscreen';
import type { PlayerVisual } from '../hooks/usePlayerVisualizer';
import { useAudioAnalyzer, type AudioAnalyzerStatus } from '../hooks/useAudioAnalyzer';
import { usePlayerControlsVisibility } from '../hooks/usePlayerControlsVisibility';
import { shouldHandlePlayerShortcut } from '../utils/playerKeyboard';
import { startVisualPreview } from '../utils/visualPreview';

type VisualizerPlayerProps = {
  glsl: string;
  visual: PlayerVisual;
};

const PAUSE_OVERLAY_MS = 500;

export function VisualizerPlayer({ glsl, visual }: VisualizerPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastToastStatusRef = useRef<AudioAnalyzerStatus | null>(null);
  const toast = useToast();
  const { getAudioData, status, isMicEnabled, toggleMic, devices, selectedDeviceId, selectDevice } =
    useAudioAnalyzer();
  const {
    targetRef: playerRootRef,
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLDivElement>();
  const controlsVisible = usePlayerControlsVisibility(playerRootRef, status, !isFullscreen);
  const [isPlaying, setIsPlaying] = useState(true);
  const isShaderPlayingRef = useRef(true);
  const pauseShaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canFavorite = !visual.isDemo;

  const scheduleShaderPause = useCallback(() => {
    if (pauseShaderTimeoutRef.current) {
      clearTimeout(pauseShaderTimeoutRef.current);
    }

    pauseShaderTimeoutRef.current = setTimeout(() => {
      isShaderPlayingRef.current = false;
      pauseShaderTimeoutRef.current = null;
    }, PAUSE_OVERLAY_MS);
  }, []);

  const resumeShader = useCallback(() => {
    if (pauseShaderTimeoutRef.current) {
      clearTimeout(pauseShaderTimeoutRef.current);
      pauseShaderTimeoutRef.current = null;
    }

    isShaderPlayingRef.current = true;
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((playing) => {
      if (playing) {
        scheduleShaderPause();
        return false;
      }

      resumeShader();
      return true;
    });
  }, [resumeShader, scheduleShaderPause]);

  useEffect(() => {
    return () => {
      if (pauseShaderTimeoutRef.current) {
        clearTimeout(pauseShaderTimeoutRef.current);
      }
    };
  }, []);
  const { isFavorited, toggleFavorite } = useFavoriteVisual(visual.id, {
    enabled: canFavorite,
  });

  const handleToggleFullscreen = useCallback(async () => {
    const didToggle = await toggleFullscreen();

    if (!didToggle) {
      toast.error('Fullscreen is not available in this browser');
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
        return;
      }

      if (key === 's') {
        event.preventDefault();
        togglePlay();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleToggleFullscreen, toggleMic, togglePlay]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return startVisualPreview(
      container,
      glsl,
      getAudioData,
      true,
      undefined,
      () => isShaderPlayingRef.current
    );
  }, [glsl, getAudioData]);

  useEffect(() => {
    if (status === lastToastStatusRef.current) return;

    lastToastStatusRef.current = status;

    if (status === 'connecting') {
      toast.info('Connecting microphone...');
      return;
    }

    if (status === 'denied') {
      toast.error('Microphone access was blocked. Enable it in browser settings');
      return;
    }

    if (status === 'error') {
      toast.error('Audio input is not available in this browser');
    }
  }, [status, toast]);

  return (
    <div ref={playerRootRef} className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
      <div
        aria-hidden
        data-testid="player-pause-overlay"
        className={`pointer-events-none absolute inset-0 z-4 bg-black transition-opacity duration-500 ease-in-out ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {!isFullscreen && (
        <div
          data-testid="player-controls-overlay"
          className="pointer-events-none absolute inset-0 z-10"
        >
          <VisualInfoCard name={visual.name} tags={visual.tags} visible={controlsVisible} />
          <div
            data-testid="player-control-bar-layer"
            className={`transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
              controlsVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <PlayerControlBar
              audioDevices={devices}
              selectedDeviceId={selectedDeviceId}
              isPlaying={isPlaying}
              isFavorited={isFavorited}
              isMicEnabled={isMicEnabled}
              showFavorite={canFavorite}
              showPlaybackControls={canFavorite}
              onTogglePlay={togglePlay}
              onToggleFavorite={() => void toggleFavorite()}
              onFullscreen={() => void handleToggleFullscreen()}
              onSelectDevice={selectDevice}
            />
          </div>
        </div>
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
