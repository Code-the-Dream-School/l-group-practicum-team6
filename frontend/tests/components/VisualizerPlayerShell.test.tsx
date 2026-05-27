import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VisualizerPlayer } from '../../src/components/VisualizerPlayerShell';

const mockToggleFullscreen = vi.fn();
const mockToggleMic = vi.fn();
const mockToggleFavorite = vi.fn();
const mockUseFullscreen = vi.fn();

vi.mock('../../src/context/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('../../src/hooks/useAudioAnalyzer', () => ({
  useAudioAnalyzer: () => ({
    getAudioData: vi.fn(),
    status: 'active',
    isMicEnabled: true,
    toggleMic: mockToggleMic,
  }),
}));

vi.mock('../../src/utils/visualPreview', () => ({
  startVisualPreview: vi.fn(() => vi.fn()),
}));

vi.mock('../../src/hooks/useFullscreen', () => ({
  useFullscreen: (...args: unknown[]) => mockUseFullscreen(...args),
}));

vi.mock('../../src/hooks/useFavoriteVisual', () => ({
  useFavoriteVisual: () => ({
    isFavorited: false,
    isLoading: false,
    toggleFavorite: mockToggleFavorite,
  }),
}));

const visual = {
  id: 'visual-1',
  name: 'Aurora Wave',
  tags: ['abstract'],
  isDemo: false,
};

describe('VisualizerPlayer fullscreen', () => {
  beforeEach(() => {
    mockToggleFullscreen.mockReset();
    mockToggleMic.mockReset();
    mockToggleFavorite.mockReset();
    mockUseFullscreen.mockReturnValue({
      targetRef: { current: null },
      isFullscreen: false,
      toggleFullscreen: mockToggleFullscreen.mockResolvedValue(true),
    });
  });

  it('shows player chrome when not in fullscreen', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    expect(screen.getByTestId('player-control-bar')).toBeInTheDocument();
    expect(screen.getByTestId('visual-info-card')).toBeInTheDocument();
  });

  it('hides player chrome in fullscreen', () => {
    mockUseFullscreen.mockReturnValue({
      targetRef: { current: null },
      isFullscreen: true,
      toggleFullscreen: mockToggleFullscreen.mockResolvedValue(true),
    });

    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    expect(screen.queryByTestId('player-control-bar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('visual-info-card')).not.toBeInTheDocument();
  });

  it('toggles fullscreen from the control bar without passing fullscreen state into it', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Fullscreen'));

    expect(mockToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('toggles the microphone with the m shortcut', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.keyDown(document, { key: 'm' });

    expect(mockToggleMic).toHaveBeenCalledTimes(1);
  });

  it('toggles the microphone from the device selector', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Turn off microphone'));

    expect(mockToggleMic).toHaveBeenCalledTimes(1);
  });

  it('toggles favorites from the heart control', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Add to favorites'));

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('toggles play and pause with the s shortcut', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    const overlay = screen.getByTestId('player-pause-overlay');
    expect(overlay).toHaveClass('opacity-0');

    fireEvent.keyDown(document, { key: 's' });

    expect(overlay).toHaveClass('opacity-100');

    fireEvent.keyDown(document, { key: 's' });

    expect(overlay).toHaveClass('opacity-0');
  });

  it('shows the pause overlay when play is clicked', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Pause'));

    expect(screen.getByTestId('player-pause-overlay')).toHaveClass('opacity-100');
  });
});
