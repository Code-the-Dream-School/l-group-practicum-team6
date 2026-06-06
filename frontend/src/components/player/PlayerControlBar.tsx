import { useState } from 'react';

import fullscreenIcon from '../../assets/icons/fullscreen.svg';
import type { AudioInputDevice } from '../../utils/audioDevices';
import DeviceSelectorButton from './DeviceSelectorButton';
import PlaybackControls from './PlaybackControls';

type PlayerControlBarProps = {
  audioDevices?: AudioInputDevice[];
  selectedDeviceId?: string;
  isPlaying?: boolean;
  isFavorited?: boolean;
  showPlaybackControls?: boolean;
  onTogglePlay?: () => void;
  onToggleFavorite?: () => void;
  onShuffle?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onFullscreen?: () => void;
  onSelectDevice?: (deviceId: string) => void;
  isMicEnabled?: boolean;
};

const defaultAudioDevices: AudioInputDevice[] = [{ deviceId: 'default', label: 'Microphone' }];

export default function PlayerControlBar({
  audioDevices = defaultAudioDevices,
  selectedDeviceId = defaultAudioDevices[0].deviceId,
  isPlaying: isPlayingProp,
  isFavorited: isFavoritedProp,
  showPlaybackControls = true,
  onTogglePlay,
  onToggleFavorite,
  onShuffle,
  onPrevious,
  onNext,
  onFullscreen,
  onSelectDevice = () => {},
  isMicEnabled = true,
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
          <DeviceSelectorButton
            devices={audioDevices}
            selectedDeviceId={selectedDeviceId}
            isMicEnabled={isMicEnabled}
            onSelectDevice={onSelectDevice}
          />
        </div>

        {showPlaybackControls && (
          <div className="flex shrink-0 justify-center" data-testid="control-bar-center">
            <PlaybackControls
              isPlaying={isPlaying}
              isFavorited={isFavorited}
              onShuffle={onShuffle}
              onPrevious={onPrevious}
              onTogglePlay={handleTogglePlay}
              onNext={onNext}
              onToggleFavorite={onToggleFavorite ? handleToggleFavorite : undefined}
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
