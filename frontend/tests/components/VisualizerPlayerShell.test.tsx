import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PLAYER_CONTROLS_HIDE_MS } from '../../src/hooks/usePlayerControlsVisibility';

import { VisualizerPlayer } from '../../src/components/VisualizerPlayerShell';

const mockToggleFullscreen = vi.fn();
const mockToggleMic = vi.fn();
const mockSelectDevice = vi.fn();
const mockToggleFavorite = vi.fn();
const mockUseFullscreen = vi.fn();
let mockMicStatus: 'idle' | 'connecting' | 'active' | 'denied' | 'error' = 'active';

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
    status: mockMicStatus,
    isMicEnabled: true,
    toggleMic: mockToggleMic,
    devices: [
      { deviceId: 'builtin', label: 'Built-in Microphone' },
      { deviceId: 'usb', label: 'USB Microphone' },
    ],
    selectedDeviceId: 'builtin',
    selectDevice: mockSelectDevice,
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

const mockGoNext = vi.fn();
const mockGoPrevious = vi.fn();

vi.mock('../../src/hooks/useVisualizerPlayback', () => ({
  useVisualizerPlayback: () => ({
    goNext: mockGoNext,
    goPrevious: mockGoPrevious,
    isNavigating: false,
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
    vi.useRealTimers();
    mockMicStatus = 'active';
    mockGoNext.mockReset();
    mockGoPrevious.mockReset();
    mockToggleFullscreen.mockReset();
    mockToggleMic.mockReset();
    mockSelectDevice.mockReset();
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

  it('selects a microphone from the device dropdown', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Select microphone'));
    fireEvent.click(screen.getByRole('option', { name: 'USB Microphone' }));

    expect(mockSelectDevice).toHaveBeenCalledWith('usb');
    expect(mockToggleMic).not.toHaveBeenCalled();
  });

  it('toggles favorites from the heart control', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Add to favorites'));

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('toggles play and pause with the space shortcut', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    const overlay = screen.getByTestId('player-pause-overlay');
    expect(overlay).toHaveClass('opacity-0');

    fireEvent.keyDown(document, { key: ' ' });

    expect(overlay).toHaveClass('opacity-100');

    fireEvent.keyDown(document, { key: ' ' });

    expect(overlay).toHaveClass('opacity-0');
  });

  it('shows the pause overlay when play is clicked', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Pause'));

    expect(screen.getByTestId('player-pause-overlay')).toHaveClass('opacity-100');
  });

  it('wires previous and next playback controls', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    fireEvent.click(screen.getByLabelText('Previous visual'));
    fireEvent.click(screen.getByLabelText('Next visual'));

    expect(mockGoPrevious).toHaveBeenCalledTimes(1);
    expect(mockGoNext).toHaveBeenCalledTimes(1);
  });

  it('navigates visuals with left and right arrow shortcuts', () => {
    render(<VisualizerPlayer glsl="void main() {}" visual={visual} showPlaybackControls />);

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(mockGoPrevious).toHaveBeenCalledTimes(1);
    expect(mockGoNext).toHaveBeenCalledTimes(1);
  });

  it('ignores arrow shortcuts when playback controls are hidden', () => {
    render(
      <VisualizerPlayer
        glsl="void main() {}"
        visual={{ ...visual, isDemo: true }}
        showPlaybackControls={false}
      />
    );

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(mockGoPrevious).not.toHaveBeenCalled();
    expect(mockGoNext).not.toHaveBeenCalled();
  });

  it('ignores arrow shortcuts when focus is in an input', () => {
    render(
      <>
        <input aria-label="Search" />
        <VisualizerPlayer glsl="void main() {}" visual={visual} showPlaybackControls />
      </>
    );

    const input = screen.getByLabelText('Search');
    input.focus();

    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });

    expect(mockGoPrevious).not.toHaveBeenCalled();
    expect(mockGoNext).not.toHaveBeenCalled();
  });
});

describe('VisualizerPlayer controls visibility', () => {
  const playerTargetRef = createRef<HTMLDivElement>();

  beforeEach(() => {
    vi.useFakeTimers();
    mockMicStatus = 'active';
    mockGoNext.mockReset();
    mockGoPrevious.mockReset();
    mockUseFullscreen.mockReturnValue({
      targetRef: playerTargetRef,
      isFullscreen: false,
      toggleFullscreen: mockToggleFullscreen.mockResolvedValue(true),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    playerTargetRef.current = null;
  });

  it('hides player controls after 3 seconds of inactivity when mic is active', () => {
    const view = render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);
    playerTargetRef.current = view.container.firstElementChild as HTMLDivElement;
    view.rerender(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    const controlBarLayer = screen.getByTestId('player-control-bar-layer');
    const infoCard = screen.getByTestId('visual-info-card');
    expect(controlBarLayer).toHaveClass('opacity-100');
    expect(infoCard).toHaveClass('opacity-100');

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS);
    });

    expect(controlBarLayer).toHaveClass('opacity-0');
    expect(infoCard).toHaveClass('opacity-0');

    act(() => {
      fireEvent.mouseMove(playerTargetRef.current as HTMLDivElement);
    });

    expect(controlBarLayer).toHaveClass('opacity-100');
    expect(infoCard).toHaveClass('opacity-100');
  });

  it('keeps player controls visible when mic state is idle', () => {
    mockMicStatus = 'idle';

    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS + 1000);
    });

    expect(screen.getByTestId('player-control-bar-layer')).toHaveClass('opacity-100');
    expect(screen.getByTestId('visual-info-card')).toHaveClass('opacity-100');
  });

  it('keeps player controls visible when mic state is denied', () => {
    mockMicStatus = 'denied';

    render(<VisualizerPlayer glsl="void main() {}" visual={visual} />);

    act(() => {
      vi.advanceTimersByTime(PLAYER_CONTROLS_HIDE_MS + 1000);
    });

    expect(screen.getByTestId('player-control-bar-layer')).toHaveClass('opacity-100');
    expect(screen.getByTestId('visual-info-card')).toHaveClass('opacity-100');
  });
});
