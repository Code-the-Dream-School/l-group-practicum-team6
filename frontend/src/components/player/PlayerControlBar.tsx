import { useState } from 'react';

import fullscreenIcon from '../../assets/icons/fullscreen.svg';
import type { AudioInputDevice } from '../../utils/audioDevices';
import DeviceSelectorButton from './DeviceSelectorButton';
import PlaybackControls from './PlaybackControls';
import HotkeysHelpButton from './HotkeysHelpButton';

type PlayerControlBarProps = {
  audioDevices?: AudioInputDevice[];
  selectedDeviceId?: string;
  isPlaying?: boolean;
  isFavorited?: boolean;
  isShuffled?: boolean;
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
  isShuffled = false,
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
      <div className="grid min-h-[110px] grid-cols-[1fr_auto_1fr] grid-rows-2 items-center gap-2 px-4 py-2 sm:min-h-[75px] sm:grid-rows-1 sm:gap-4 sm:px-6 sm:py-0">
        <div
          className="col-start-1 row-start-1 flex min-w-0 items-center justify-self-start sm:row-start-auto"
          data-testid="control-bar-left"
        >
          <DeviceSelectorButton
            devices={audioDevices}
            selectedDeviceId={selectedDeviceId}
            isMicEnabled={isMicEnabled}
            onSelectDevice={onSelectDevice}
          />
        </div>

        {showPlaybackControls && (
          <div
            className="col-span-3 row-start-2 flex items-center justify-center justify-self-center sm:col-span-1 sm:col-start-2 sm:row-start-auto"
            data-testid="control-bar-center"
          >
            <PlaybackControls
              isPlaying={isPlaying}
              isFavorited={isFavorited}
              isShuffled={isShuffled}
              onShuffle={onShuffle}
              onPrevious={onPrevious}
              onTogglePlay={handleTogglePlay}
              onNext={onNext}
              onToggleFavorite={onToggleFavorite ? handleToggleFavorite : undefined}
            />
          </div>
        )}

        <div
          className="col-start-3 row-start-1 flex items-center justify-end justify-self-end gap-2 sm:row-start-auto"
          data-testid="control-bar-right"
        >
          <HotkeysHelpButton />

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
