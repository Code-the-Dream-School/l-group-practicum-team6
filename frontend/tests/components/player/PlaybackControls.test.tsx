import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PlaybackControls from '../../../src/components/player/PlaybackControls';

describe('PlaybackControls', () => {
  it('renders all basic playback buttons', () => {
    render(<PlaybackControls isPlaying={true} />);

    expect(screen.getByTestId('playback-controls')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shuffle/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous visual/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next visual/i })).toBeInTheDocument();
  });

  it('shows Play label when not playing', () => {
    render(<PlaybackControls isPlaying={false} />);

    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
  });

  it('shows Pause label when playing', () => {
    render(<PlaybackControls isPlaying={true} />);

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^play$/i })).not.toBeInTheDocument();
  });

  it('marks shuffle as pressed when shuffled', () => {
    render(<PlaybackControls isPlaying={true} isShuffled />);

    expect(screen.getByRole('button', { name: /shuffle/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('marks shuffle as not pressed by default', () => {
    render(<PlaybackControls isPlaying={true} />);

    expect(screen.getByRole('button', { name: /shuffle/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('calls playback callbacks when buttons are clicked', () => {
    const onShuffle = vi.fn();
    const onPrevious = vi.fn();
    const onTogglePlay = vi.fn();
    const onNext = vi.fn();

    render(
      <PlaybackControls
        isPlaying={true}
        onShuffle={onShuffle}
        onPrevious={onPrevious}
        onTogglePlay={onTogglePlay}
        onNext={onNext}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /shuffle/i }));
    fireEvent.click(screen.getByRole('button', { name: /previous visual/i }));
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    fireEvent.click(screen.getByRole('button', { name: /next visual/i }));

    expect(onShuffle).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('does not render favorite button when onToggleFavorite is not provided', () => {
    render(<PlaybackControls isPlaying={true} />);

    expect(screen.queryByRole('button', { name: /favorites/i })).not.toBeInTheDocument();
  });

  it('renders add to favorites button when not favorited', () => {
    render(<PlaybackControls isPlaying={true} onToggleFavorite={vi.fn()} />);

    expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
  });

  it('renders remove from favorites button when favorited', () => {
    render(<PlaybackControls isPlaying={true} isFavorited onToggleFavorite={vi.fn()} />);

    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
  });

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const onToggleFavorite = vi.fn();

    render(<PlaybackControls isPlaying={true} onToggleFavorite={onToggleFavorite} />);

    fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });
});
