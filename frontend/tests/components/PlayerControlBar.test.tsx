import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import PlayerControlBar from '../../src/components/player/PlayerControlBar';

describe('PlayerControlBar', () => {
  it('renders left, center, and right control zones', () => {
    render(<PlayerControlBar />);

    expect(screen.getByTestId('control-bar-left')).toBeInTheDocument();
    expect(screen.getByTestId('control-bar-center')).toBeInTheDocument();
    expect(screen.getByTestId('control-bar-right')).toBeInTheDocument();
  });

  it('renders the selected device label', () => {
    render(
      <PlayerControlBar
        audioDevices={[{ deviceId: 'builtin', label: 'Microphone — Built-in' }]}
        selectedDeviceId="builtin"
      />
    );

    expect(screen.getByText('Microphone — Built-in')).toBeInTheDocument();
  });

  it('toggles play and pause icon when play button is clicked', () => {
    function ControlledBar() {
      const [isPlaying, setIsPlaying] = useState(true);

      return (
        <PlayerControlBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((value) => !value)}
        />
      );
    }

    render(<ControlledBar />);

    expect(screen.getByLabelText('Pause')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Pause'));

    expect(screen.getByLabelText('Play')).toBeInTheDocument();
  });

  it('hides playback controls when showPlaybackControls is false', () => {
    render(<PlayerControlBar showPlaybackControls={false} />);

    expect(screen.queryByTestId('playback-controls')).not.toBeInTheDocument();
    expect(screen.queryByTestId('control-bar-center')).not.toBeInTheDocument();
  });

  it('hides favorite control when showFavorite is false', () => {
    render(<PlayerControlBar showFavorite={false} />);

    expect(screen.queryByLabelText(/favorite/i)).not.toBeInTheDocument();
  });

  it('renders fullscreen button with a static label', () => {
    render(<PlayerControlBar />);

    expect(screen.getByLabelText('Fullscreen')).toBeInTheDocument();
    expect(screen.queryByLabelText('Exit fullscreen')).not.toBeInTheDocument();
  });

  it('calls onFullscreen when fullscreen button is clicked', () => {
    const onFullscreen = vi.fn();

    render(<PlayerControlBar onFullscreen={onFullscreen} />);

    fireEvent.click(screen.getByLabelText('Fullscreen'));

    expect(onFullscreen).toHaveBeenCalledTimes(1);
  });
});
