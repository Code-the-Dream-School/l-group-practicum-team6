import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { QueryClientTestProvider } from '../../src/test/queryClient';

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => ({
    user: { _id: 'user-1', name: 'Test User', email: 'test@example.com', createdAt: '' },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
}));

vi.mock('../../src/components/VisualizerCard', () => ({
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

vi.mock('../../src/context/useToast', () => ({
  useToast: () => mockToast,
}));

const getSavedVisuals = vi.fn();
const removeVisual = vi.fn();

vi.mock('../../src/api/users', () => ({
  getSavedVisuals: (...args: unknown[]) => getSavedVisuals(...args),
}));

vi.mock('../../src/api', () => ({
  removeVisual: (...args: unknown[]) => removeVisual(...args),
}));

import MyVisualsPage from '../../src/pages/MyVisualsPage';

function renderMyVisualsPage() {
  return render(
    <QueryClientTestProvider>
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    </QueryClientTestProvider>
  );
}

const savedVisuals = [
  {
    _id: 'saved-1',
    userId: 'user-1',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    visualizerId: {
      _id: 'visual-b',
      name: 'Beta Visual',
      source: '',
      glsl: 'void main() {}',
      isDemo: false,
    },
  },
  {
    _id: 'saved-2',
    userId: 'user-1',
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
    visualizerId: {
      _id: 'visual-a',
      name: 'Alpha Visual',
      source: '',
      glsl: 'void main() {}',
      isDemo: false,
    },
  },
];

describe('MyVisualsPage', () => {
  beforeEach(() => {
    queryClient.clear();
    getSavedVisuals.mockReset();
    removeVisual.mockReset();
    mockToast.success.mockReset();
    mockToast.error.mockReset();
    mockToast.info.mockReset();
    getSavedVisuals.mockResolvedValue({ data: savedVisuals });
    removeVisual.mockResolvedValue({ msg: 'removed' });
  });

  it('shows a loading state before favorites are fetched', () => {
    getSavedVisuals.mockReturnValue(new Promise(() => undefined));

    renderMyVisualsPage();

    expect(screen.getByText(/Loading your saved visualizers/i)).toBeInTheDocument();
  });

  it('renders saved visualizers after loading', async () => {
    renderMyVisualsPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
      expect(screen.getByText('Beta Visual')).toBeInTheDocument();
    });
  });

  it('shows a toast and falls back to empty state when loading fails', async () => {
    getSavedVisuals.mockRejectedValue(new Error('network'));

    renderMyVisualsPage();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Unable to load saved visualizers');
      expect(screen.getByText(/No favorites yet/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state when there are no favorites', async () => {
    getSavedVisuals.mockResolvedValue({ data: [] });

    renderMyVisualsPage();

    await waitFor(() => {
      expect(screen.getByText(/No favorites yet/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Explore Visuals/i })).toHaveAttribute(
        'href',
        '/explore'
      );
    });
  });

  it('sorts favorites alphabetically', async () => {
    renderMyVisualsPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/Sort by/i));
    fireEvent.click(screen.getByRole('option', { name: 'A-Z' }));

    const cards = screen.getAllByText(/Visual$/);
    expect(cards[0]).toHaveTextContent('Alpha Visual');
    expect(cards[1]).toHaveTextContent('Beta Visual');
  });

  it('removes a favorite after confirmation', async () => {
    getSavedVisuals.mockResolvedValueOnce({ data: savedVisuals }).mockResolvedValue({
      data: savedVisuals.filter((saved) => saved.visualizerId._id !== 'visual-b'),
    });

    renderMyVisualsPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(removeVisual).toHaveBeenCalledWith('visual-b', expect.anything());
      expect(screen.queryByText('Beta Visual')).not.toBeInTheDocument();
    });
    expect(mockToast.success).toHaveBeenCalledWith('Visualizer removed from favorites.');
  });

  it('restores favorites and shows a toast when removal fails', async () => {
    removeVisual.mockRejectedValue(new Error('failed'));

    renderMyVisualsPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Unable to remove visualizer');
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });
  });

  it('cancels removal when the user dismisses the confirmation', async () => {
    renderMyVisualsPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(removeVisual).not.toHaveBeenCalled();
    expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    expect(screen.queryByText(/Remove from collection/i)).not.toBeInTheDocument();
  });
});
