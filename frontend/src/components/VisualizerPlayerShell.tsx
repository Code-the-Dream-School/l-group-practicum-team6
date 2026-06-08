import { useCallback, useEffect, useRef, useState } from 'react';

import { ROUTES } from '@sonix/shared';

import BackButton from './BackButton';
import NavBar from './NavBar';
import PlayerControlBar from './player/PlayerControlBar';
import VisualInfoCard from './player/VisualInfoCard';
import { useToast } from '../context/useToast';
import { useFavoriteVisual } from '../hooks/useFavoriteVisual';
import { useVisualizerPlayback } from '../hooks/useVisualizerPlayback';
import { useFullscreen } from '../hooks/useFullscreen';
import type { PlayerVisual } from '../hooks/usePlayerVisualizer';
import { useAudioAnalyzer, type AudioAnalyzerStatus } from '../hooks/useAudioAnalyzer';
import { usePlayerControlsVisibility } from '../hooks/usePlayerControlsVisibility';
import { shouldHandlePlayerShortcut } from '../utils/playerKeyboard';
import { startVisualPreview } from '../utils/visualPreview';

type VisualizerPlayerProps = {
  glsl: string;
  visual: PlayerVisual;
  showPlaybackControls?: boolean;
  showInfoCard?: boolean;
  captureRef?: { current: ((blob: Blob) => void) | null };
  /** Back-button fallback route when there is no history. */
  backFallback?: string;
};

const PAUSE_OVERLAY_MS = 500;

export function VisualizerPlayer({
  glsl,
  visual,
  showPlaybackControls = !visual.isDemo,
  showInfoCard = true,
  captureRef,
  backFallback = ROUTES.HOME,
}: VisualizerPlayerProps) {
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
  const { isFavorited, toggleFavorite } = useFavoriteVisual(visual.id);
  const { goNext, goPrevious, isShuffled, toggleShuffle } = useVisualizerPlayback(visual.id);

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

      if (key === 'f' || key === 'enter') {
        event.preventDefault();
        void handleToggleFullscreen();
        return;
      }

      if (key === 'm') {
        event.preventDefault();
        toggleMic();
        return;
      }

      if (key === ' ' || key === 'space') {
        event.preventDefault();
        togglePlay();
        return;
      }

      if (!showPlaybackControls) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrevious();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [goNext, goPrevious, handleToggleFullscreen, showPlaybackControls, toggleMic, togglePlay]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return startVisualPreview(
      container,
      glsl,
      getAudioData,
      true,
      undefined,
      () => isShaderPlayingRef.current,
      captureRef
    );
  }, [glsl, getAudioData, captureRef]);

  useEffect(() => {
    if (status === lastToastStatusRef.current) return;

    lastToastStatusRef.current = status;

    if (status === 'connecting') {
      toast.info('Connecting audio source...');
      return;
    }

    if (status === 'denied') {
      toast.error('Audio access was blocked. Check browser permissions.');
      return;
    }

    if (status === 'ended') {
      toast.info('Tab or screen sharing ended');
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
      {isFullscreen && (
        <button
          type="button"
          aria-label="Exit fullscreen"
          data-testid="player-fullscreen-exit"
          onClick={() => void handleToggleFullscreen()}
          className="pointer-events-auto absolute right-4 bottom-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full  bg-black/50 outline-none backdrop-blur transition hover:bg-black/70 md:hidden"
        >
          <img src="/icons/fullscrnExit.svg" alt="" className="h-6 w-6 brightness-0 invert" />
        </button>
      )}
      {!isFullscreen && (
        <div
          data-testid="player-controls-overlay"
          className="pointer-events-none absolute inset-0 z-10"
        >
          {showInfoCard ? (
            <VisualInfoCard
              name={visual.name}
              tags={visual.tags}
              visible={controlsVisible}
              backFallback={backFallback}
            />
          ) : (
            backFallback && (
              <BackButton
                fallback={backFallback}
                className="pointer-events-auto absolute left-3 top-3 z-[5]"
              />
            )
          )}
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
              showPlaybackControls={showPlaybackControls}
              onTogglePlay={togglePlay}
              isShuffled={isShuffled}
              onShuffle={() => void toggleShuffle()}
              onPrevious={goPrevious}
              onNext={goNext}
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
