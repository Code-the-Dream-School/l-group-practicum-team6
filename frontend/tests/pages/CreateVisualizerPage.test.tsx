import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CreateVisualizerPage from '../../src/pages/CreateVisualizerPage';
import { generateVisualiser, createAdminVisualizer, uploadVisualizerImage } from '../../src/api';

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('../../src/components/NavBar', () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock('../../src/components/BackButton', () => ({
  default: () => <button type="button">Back</button>,
}));

vi.mock('../../src/components/VisualizerPlayerShell', () => ({
  VisualizerPlayer: ({
    visual,
    captureRef,
  }: {
    visual: { name: string };
    captureRef?: React.RefObject<((blob: Blob) => void) | null>;
  }) => (
    <div data-testid="visualizer-preview">
      <span>{visual.name}</span>
      <button
        type="button"
        onClick={() => captureRef?.current?.(new Blob(['preview'], { type: 'image/png' }))}
      >
        Capture Preview
      </button>
    </div>
  ),
}));

vi.mock('../../src/api', () => ({
  generateVisualiser: vi.fn(),
  createAdminVisualizer: vi.fn(),
  uploadVisualizerImage: vi.fn(),
}));

vi.mock('../../src/context/useToast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    info: vi.fn(),
  }),
}));

const mockedGenerateVisualiser = vi.mocked(generateVisualiser);
const mockedCreateAdminVisualizer = vi.mocked(createAdminVisualizer);
const mockedUploadVisualizerImage = vi.mocked(uploadVisualizerImage);

function renderCreateVisualizerPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/visualizers/create']}>
      <Routes>
        <Route path="/admin/visualizers/create" element={<CreateVisualizerPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CreateVisualizerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome preview and disabled generate button initially', () => {
    renderCreateVisualizerPage();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('visualizer-preview')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/describe it/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^generate$/i })).toBeDisabled();
  });

  it('enables generate button after prompt is entered', async () => {
    const user = userEvent.setup();

    renderCreateVisualizerPage();

    const promptInput = screen.getByPlaceholderText(/describe it/i);
    const generateButton = screen.getByRole('button', { name: /^generate$/i });

    expect(generateButton).toBeDisabled();
    await user.type(promptInput, 'ocean visualizer');
    expect(generateButton).toBeEnabled();
  });

  it('generates a visualizer and shows generated preview with save button', async () => {
    const user = userEvent.setup();

    mockedGenerateVisualiser.mockResolvedValue({
      data: {
        name: 'Ocean Pulse',
        source: 'generated',
        glsl: 'void main() {}',
        tags: ['ocean', 'pulse'],
      },
    });

    renderCreateVisualizerPage();

    await user.type(screen.getByPlaceholderText(/describe it/i), 'ocean visualizer');

    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    await waitFor(() => {
      expect(mockedGenerateVisualiser).toHaveBeenCalledTimes(1);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Shader generated — review and save.');
    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument();
  });

  it('shows an error toast when generation fails', async () => {
    const user = userEvent.setup();

    mockedGenerateVisualiser.mockRejectedValue(new Error('Generation failed'));

    renderCreateVisualizerPage();

    await user.type(screen.getByPlaceholderText(/describe it/i), 'make something cool');
    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });

    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });

  it('randomizes the prompt', async () => {
    const user = userEvent.setup();

    renderCreateVisualizerPage();

    const promptInput = screen.getByPlaceholderText(/describe it/i);

    expect(promptInput).toHaveValue('');

    await user.click(screen.getByRole('button', { name: /randomize prompt/i }));

    expect(promptInput).not.toHaveValue('');
  });

  it('saves generated visualizer after preview capture', async () => {
    const user = userEvent.setup();

    mockedGenerateVisualiser.mockResolvedValue({
      data: {
        name: 'Ocean Pulse',
        source: 'Gemini',
        glsl: 'void main() {}',
        tags: ['ocean'],
      },
    });

    mockedUploadVisualizerImage.mockResolvedValue({
      data: {
        _id: 'visualizer-1',
        name: 'Ocean Pulse',
        source: 'Gemini',
        glsl: 'void main() {}',
        imageUrl: '/preview.png',
        isDemo: false,
        tags: ['ocean'],
      },
    });

    mockedCreateAdminVisualizer.mockResolvedValue({
      data: {
        _id: 'visualizer-1',
        name: 'Ocean Pulse',
        source: 'Gemini',
        glsl: 'void main() {}',
        isDemo: false,
        tags: ['ocean'],
      },
    });

    renderCreateVisualizerPage();

    await user.type(screen.getByPlaceholderText(/describe it/i), 'ocean visualizer');
    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^save$/i }));
    await user.click(screen.getByRole('button', { name: /capture preview/i }));

    await waitFor(() => {
      expect(mockedUploadVisualizerImage).toHaveBeenCalledTimes(1);
      expect(mockedCreateAdminVisualizer).toHaveBeenCalledWith({
        name: 'Ocean Pulse',
        glsl: 'void main() {}',
        tags: ['ocean'],
        isDemo: false,
        source: 'Gemini',
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Visualizer saved.');
  });

  it('shows error toast when save fails after preview capture', async () => {
    const user = userEvent.setup();

    mockedGenerateVisualiser.mockResolvedValue({
      data: {
        name: 'Ocean Pulse',
        source: 'Gemini',
        glsl: 'void main() {}',
        tags: ['ocean'],
      },
    });

    mockedCreateAdminVisualizer.mockResolvedValue({
      data: {
        _id: 'visualizer-1',
        name: 'Ocean Pulse',
        source: 'Gemini',
        glsl: 'void main() {}',
        isDemo: false,
        tags: ['ocean'],
      },
    });

    mockedUploadVisualizerImage.mockRejectedValue(new Error('Upload failed'));

    renderCreateVisualizerPage();

    await user.type(screen.getByPlaceholderText(/describe it/i), 'ocean visualizer');
    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^save$/i }));
    await user.click(screen.getByRole('button', { name: /capture preview/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });

    expect(mockedCreateAdminVisualizer).toHaveBeenCalled();
  });
});
