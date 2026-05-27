import { useState } from 'react';

import fullscreenIcon from '../../assets/icons/fullscreen.svg';
import DeviceSelectorButton from './DeviceSelectorButton';
import PlaybackControls from './PlaybackControls';

type PlayerControlBarProps = {
  deviceLabel?: string;
  isPlaying?: boolean;
  isFavorited?: boolean;
  showFavorite?: boolean;
  showPlaybackControls?: boolean;
  onTogglePlay?: () => void;
  onToggleFavorite?: () => void;
  onShuffle?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onFullscreen?: () => void;
  onDeviceSelect?: () => void;
};

export default function PlayerControlBar({
  deviceLabel = 'input',
  isPlaying: isPlayingProp,
  isFavorited: isFavoritedProp,
  showFavorite = true,
  showPlaybackControls = true,
  onTogglePlay,
  onToggleFavorite,
  onShuffle,
  onPrevious,
  onNext,
  onFullscreen,
  onDeviceSelect,
}: PlayerControlBarProps) {
  const [isPlayingInternal, setIsPlayingInternal] = useState(true);
  const [isFavoritedInternal, setIsFavoritedInternal] = useState(false);

  const isPlaying = isPlayingProp !== undefined ? isPlayingProp : isPlayingInternal;
  const isFavorited = isFavoritedProp !== undefined ? isFavoritedProp : isFavoritedInternal;

  function handleTogglePlay() {
    if (onTogglePlay) {
      onTogglePlay();
      return;
    }

    setIsPlayingInternal((value) => !value);
  }

  function handleToggleFavorite() {
    if (onToggleFavorite) {
      onToggleFavorite();
      return;
    }

    setIsFavoritedInternal((value) => !value);
  }

  return (
    <div
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 border-t bg-surface border-primary-border"
      data-testid="player-control-bar"
    >
      <div className="flex h-[75px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4" data-testid="control-bar-left">
          <DeviceSelectorButton deviceLabel={deviceLabel} onClick={onDeviceSelect} />
        </div>

        {showPlaybackControls && (
          <div className="flex shrink-0 justify-center" data-testid="control-bar-center">
            <PlaybackControls
              isPlaying={isPlaying}
              isFavorited={isFavorited}
              showFavorite={showFavorite}
              onShuffle={onShuffle}
              onPrevious={onPrevious}
              onTogglePlay={handleTogglePlay}
              onNext={onNext}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        <div className="flex flex-1 items-center justify-end" data-testid="control-bar-right">
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={onFullscreen ?? (() => {})}
            className="cursor-pointer outline-none transition hover:opacity-80"
          >
            <img src={fullscreenIcon} alt="" className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
