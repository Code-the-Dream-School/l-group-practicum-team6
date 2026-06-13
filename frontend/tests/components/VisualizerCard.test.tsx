import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockStartVisualPreview } = vi.hoisted(() => ({
  mockStartVisualPreview: vi.fn(() => vi.fn()),
}));
let setPreviewActive: ((active: boolean) => void) | null = null;

vi.mock('../../src/hooks/usePreviewGlsl', () => ({
  usePreviewGlsl: vi.fn(() => null),
}));

vi.mock('../../src/utils/visualPreview', () => ({
  activateVisualPreview: vi.fn(() => setPreviewActive?.(true)),
  deactivateVisualPreview: vi.fn(() => setPreviewActive?.(false)),
  listenToActiveVisualPreview: vi.fn((_id: string, callback: (active: boolean) => void) => {
    setPreviewActive = callback;
    callback(false);
    return vi.fn();
  }),
  startVisualPreview: mockStartVisualPreview,
}));

import { usePreviewGlsl } from '../../src/hooks/usePreviewGlsl';
import VisualizerCard from '../../src/components/VisualizerCard';

const mockedUsePreviewGlsl = vi.mocked(usePreviewGlsl);

function renderCard(overrides: Partial<Parameters<typeof VisualizerCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <VisualizerCard
        id="visual-1"
        name="Pulse Waves"
        tags={['Audio', 'Spectrum']}
        playPath="/visualizer/visual-1"
        {...overrides}
      />
    </MemoryRouter>
  );
}

describe('VisualizerCard', () => {
  beforeEach(() => {
    mockStartVisualPreview.mockClear();
    mockedUsePreviewGlsl.mockReturnValue(null);
    setPreviewActive = null;
  });

  it('renders visualizer details and navigation links', () => {
    renderCard({ thumbnailUrl: '/api/v1/images/visualizers/visual-1' });

    expect(screen.getByRole('heading', { name: 'Pulse Waves' })).toBeInTheDocument();
    expect(screen.getAllByText('Audio')).toHaveLength(2);
    expect(screen.getByText('Spectrum')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Open Pulse Waves/i })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Play' })).toHaveAttribute(
      'href',
      '/visualizer/visual-1'
    );
    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      '/api/v1/images/visualizers/visual-1'
    );
  });

  it('shows a live preview placeholder when no thumbnail is provided', () => {
    renderCard();

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('activates and deactivates preview on hover', () => {
    renderCard();

    const previewLink = screen.getByRole('link', { name: /Open Pulse Waves/i });

    fireEvent.mouseEnter(previewLink);
    fireEvent.mouseLeave(previewLink);

    expect(setPreviewActive).toBeTruthy();
  });

  it('starts a visual preview when shader code is available', () => {
    mockedUsePreviewGlsl.mockReturnValue('void main() {}');

    renderCard();

    fireEvent.mouseEnter(screen.getByRole('link', { name: /Open Pulse Waves/i }));

    expect(mockStartVisualPreview).toHaveBeenCalled();
  });

  it('renders save controls and calls onToggleSave', () => {
    const onToggleSave = vi.fn();

    renderCard({ canSave: true, isSaved: false, onToggleSave });

    fireEvent.click(screen.getByRole('button', { name: 'Save Pulse Waves' }));

    expect(onToggleSave).toHaveBeenCalledWith('visual-1');
    expect(screen.getByRole('button', { name: 'Save Pulse Waves' })).toHaveTextContent('\u2661');
  });
});
