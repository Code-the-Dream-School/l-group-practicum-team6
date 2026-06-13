import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminVisualizersPage from '../../src/pages/AdminVisualizersPage';
import {
  createAdminVisualizer,
  deleteAdminVisualizer,
  getVisualizer,
  listVisualizers,
  updateAdminVisualizer,
} from '../../src/api';

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('../../src/components/NavBar', () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock('../../src/components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock('../../src/api', () => ({
  listVisualizers: vi.fn(),
  getVisualizer: vi.fn(),
  createAdminVisualizer: vi.fn(),
  updateAdminVisualizer: vi.fn(),
  deleteAdminVisualizer: vi.fn(),
}));

vi.mock('../../src/context/useToast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    info: vi.fn(),
  }),
}));

const mockedListVisualizers = vi.mocked(listVisualizers);
const mockedGetVisualizer = vi.mocked(getVisualizer);
const mockedCreateAdminVisualizer = vi.mocked(createAdminVisualizer);
const mockedUpdateAdminVisualizer = vi.mocked(updateAdminVisualizer);
const mockedDeleteAdminVisualizer = vi.mocked(deleteAdminVisualizer);

const visualizers = [
  {
    _id: 'visualizer-1',
    name: 'Ocean Pulse',
    imageUrl: '/ocean.png',
    isDemo: true,
    source: 'Gemini',
    tags: ['ocean', 'bass'],
  },
  {
    _id: 'visualizer-2',
    name: 'Fire Glow',
    imageUrl: '/fire.png',
    isDemo: false,
    source: 'Manual',
    tags: ['fire'],
  },
];

function mockList(data = visualizers) {
  mockedListVisualizers.mockResolvedValue({
    data,
    total: data.length,
    page: 1,
    pages: 1,
  });
}

describe('AdminVisualizersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockList();
  });

  it('loads and renders visualizers', async () => {
    render(<AdminVisualizersPage />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText(/admin visualizer manager/i)).toBeInTheDocument();

    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();
    expect(screen.getByText('Fire Glow')).toBeInTheDocument();

    expect(mockedListVisualizers).toHaveBeenCalledWith({ page: 1, limit: 100 });
  });

  it('shows empty state when no visualizers are found', async () => {
    mockList([]);

    render(<AdminVisualizersPage />);

    expect(await screen.findByText(/no visualizers found/i)).toBeInTheDocument();
  });

  it('filters visualizers by search text', async () => {
    const user = userEvent.setup();

    render(<AdminVisualizersPage />);

    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/search by name/i), 'fire');

    expect(screen.getByText('Fire Glow')).toBeInTheDocument();
    expect(screen.queryByText('Ocean Pulse')).not.toBeInTheDocument();
  });

  it('creates a visualizer', async () => {
    const user = userEvent.setup();

    mockedCreateAdminVisualizer.mockResolvedValue({
      data: {
        _id: 'visualizer-3',
        name: 'New Visual',
        source: 'Manual',
        glsl: 'void main() {}',
        imageUrl: '/new.png',
        isDemo: true,
        tags: ['new', 'test'],
      },
    });

    render(<AdminVisualizersPage />);

    await screen.findByText('Ocean Pulse');

    await user.type(screen.getByLabelText(/^name$/i), 'New Visual');
    await user.type(screen.getByLabelText(/image url/i), '/new.png');
    fireEvent.change(screen.getByLabelText(/^glsl$/i), {
      target: {
        value: 'void main() {}',
      },
    });
    await user.type(screen.getByLabelText(/tags/i), 'New, Test');
    await user.type(screen.getByLabelText(/source/i), 'Manual');
    await user.click(screen.getByLabelText(/mark as demo/i));

    await user.click(screen.getByRole('button', { name: /create visualizer/i }));

    await waitFor(() => {
      expect(mockedCreateAdminVisualizer).toHaveBeenCalledWith({
        name: 'New Visual',
        glsl: 'void main() {}',
        source: 'Manual',
        imageUrl: '/new.png',
        isDemo: true,
        tags: ['new', 'test'],
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Visualizer created.');
  });

  it('loads visualizer details and updates an existing visualizer', async () => {
    const user = userEvent.setup();

    mockedGetVisualizer.mockResolvedValue({
      data: {
        _id: 'visualizer-1',
        name: 'Ocean Pulse',
        source: 'Gemini',
        glsl: 'void main() {}',
        imageUrl: '/ocean.png',
        isDemo: true,
        tags: ['ocean', 'bass'],
      },
    });

    mockedUpdateAdminVisualizer.mockResolvedValue({
      data: {
        _id: 'visualizer-1',
        name: 'Ocean Updated',
        source: 'Gemini',
        glsl: 'void main() {}',
        imageUrl: '/ocean.png',
        isDemo: true,
        tags: ['ocean'],
      },
    });

    render(<AdminVisualizersPage />);

    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(await screen.findByRole('button', { name: /update visualizer/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/^name$/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Ocean Updated');

    await user.click(screen.getByRole('button', { name: /update visualizer/i }));

    await waitFor(() => {
      expect(mockedUpdateAdminVisualizer).toHaveBeenCalledWith(
        'visualizer-1',
        expect.objectContaining({
          name: 'Ocean Updated',
          tags: ['ocean', 'bass'],
          isDemo: true,
          source: 'Gemini',
        })
      );
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Visualizer updated.');
  });

  it('deletes a visualizer after confirmation', async () => {
    const user = userEvent.setup();

    mockedDeleteAdminVisualizer.mockResolvedValue(undefined);

    render(<AdminVisualizersPage />);

    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedDeleteAdminVisualizer).toHaveBeenCalledWith('visualizer-1');
    expect(mockToastSuccess).toHaveBeenCalledWith('Visualizer deleted.');
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();

    vi.mocked(window.confirm).mockReturnValue(false);

    render(<AdminVisualizersPage />);

    expect(await screen.findByText('Ocean Pulse')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(mockedDeleteAdminVisualizer).not.toHaveBeenCalled();
  });

  it('shows error toast when visualizers fail to load', async () => {
    mockedListVisualizers.mockRejectedValue(new Error('Load failed'));

    render(<AdminVisualizersPage />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });

    expect(await screen.findByText(/no visualizers found/i)).toBeInTheDocument();
  });
});
