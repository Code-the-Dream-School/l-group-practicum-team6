import nextIcon from '../../assets/icons/next.svg';
import pauseIcon from '../../assets/icons/pause.svg';
import playIcon from '../../assets/icons/play.svg';
import previousIcon from '../../assets/icons/previous.svg';
import shuffleIcon from '../../assets/icons/shuffle.svg';
import shuffleIconActive from '../../assets/icons/shuffled.svg';

type PlaybackControlsProps = {
  isPlaying: boolean;
  isFavorited?: boolean;
  isShuffled?: boolean;
  onShuffle?: () => void;
  onPrevious?: () => void;
  onTogglePlay?: () => void;
  onNext?: () => void;
  onToggleFavorite?: () => void;
};

export default function PlaybackControls({
  isPlaying,
  isFavorited = false,
  isShuffled = false,
  onShuffle = () => {},
  onPrevious = () => {},
  onTogglePlay = () => {},
  onNext = () => {},
  onToggleFavorite,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-6" data-testid="playback-controls">
      <button
        type="button"
        aria-label="Shuffle"
        aria-pressed={isShuffled}
        onClick={onShuffle}
        className={'cursor-pointer transition hover:opacity-80 outline-none'}
      >
        <img src={isShuffled ? shuffleIconActive : shuffleIcon} alt="" className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Previous visual"
        onClick={onPrevious}
        className="cursor-pointer transition hover:opacity-80 outline-none"
      >
        <img src={previousIcon} alt="" className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={onTogglePlay}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#7c5cfc] shadow-[0_0_24px_rgba(124,92,252,0.55)] transition hover:bg-[#8d6cfc] outline-none"
      >
        <img
          src={isPlaying ? pauseIcon : playIcon}
          alt=""
          className={isPlaying ? 'h-5 w-5' : 'h-10 w-10 brightness-0 invert'}
        />
      </button>

      <button
        type="button"
        aria-label="Next visual"
        onClick={onNext}
        className="cursor-pointer transition hover:opacity-80 outline-none"
      >
        <img src={nextIcon} alt="" className="h-5 w-5" />
      </button>

      {onToggleFavorite && (
        <button
          type="button"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          onClick={onToggleFavorite}
          className={`cursor-pointer px-1 text-xl leading-none transition hover:opacity-80 outline-none ${
            isFavorited ? 'text-secondary' : 'text-text-secondary'
          }`}
        >
          {isFavorited ? '\u2665' : '\u2661'}
        </button>
      )}
    </div>
  );
}
