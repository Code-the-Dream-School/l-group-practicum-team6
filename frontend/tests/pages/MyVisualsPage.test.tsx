import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const getSavedVisuals = vi.fn();
const removeVisual = vi.fn();

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual<typeof import('../../src/api')>('../../src/api');

  return {
    ...actual,
    getSavedVisuals: (...args: unknown[]) => getSavedVisuals(...args),
    removeVisual: (...args: unknown[]) => removeVisual(...args),
  };
});

import MyVisualsPage from '../../src/pages/MyVisualsPage';

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
    getSavedVisuals.mockReset();
    removeVisual.mockReset();
    getSavedVisuals.mockResolvedValue({ data: savedVisuals });
    removeVisual.mockResolvedValue({ msg: 'removed' });
  });

  it('shows a loading state before favorites are fetched', () => {
    getSavedVisuals.mockReturnValue(new Promise(() => undefined));

    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading your saved visualizers/i)).toBeInTheDocument();
  });

  it('renders saved visualizers after loading', async () => {
    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
      expect(screen.getByText('Beta Visual')).toBeInTheDocument();
    });
  });

  it('shows an error message when loading fails', async () => {
    getSavedVisuals.mockRejectedValue(new Error('network'));

    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Could not load favorites/i)).toBeInTheDocument();
      expect(screen.getByText(/Unable to load your saved visualizers/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state when there are no favorites', async () => {
    getSavedVisuals.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No favorites yet/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Explore Visuals/i })).toHaveAttribute(
        'href',
        '/explore'
      );
    });
  });

  it('sorts favorites alphabetically', async () => {
    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Sort by/i), { target: { value: 'az' } });

    const cards = screen.getAllByText(/Visual$/);
    expect(cards[0]).toHaveTextContent('Alpha Visual');
    expect(cards[1]).toHaveTextContent('Beta Visual');
  });

  it('removes a favorite after confirmation', async () => {
    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(removeVisual).toHaveBeenCalledWith('visual-b');
      expect(screen.queryByText('Beta Visual')).not.toBeInTheDocument();
    });
  });

  it('restores favorites when removal fails', async () => {
    removeVisual.mockRejectedValue(new Error('failed'));

    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha Visual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(screen.getByText(/Could not remove visualizer/i)).toBeInTheDocument();
    });
  });

  it('cancels removal when the user dismisses the confirmation', async () => {
    render(
      <MemoryRouter>
        <MyVisualsPage />
      </MemoryRouter>
    );

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
