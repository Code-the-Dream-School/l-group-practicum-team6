import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/context/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
  })),
}));

vi.mock('../../src/api/visualizers', () => ({
  listVisualizers: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pages: 0 }),
  getVisualizerTags: vi.fn().mockResolvedValue({
    data: ['geometric', 'audio', 'spectrum', 'fractal', 'warp'],
  }),
  getVisualizer: vi.fn().mockResolvedValue({
    data: {
      _id: 'visual123',
      name: 'Test Visualizer',
      source: '',
      glsl: 'void main() {}',
      isDemo: false,
    },
  }),
  getDemoVisualizer: vi.fn().mockResolvedValue({
    data: {
      _id: 'demo123',
      name: 'Demo Visualizer',
      source: '',
      glsl: 'void main() {}',
      isDemo: true,
    },
  }),
}));

vi.mock('../../src/hooks/useAudioAnalyzer', () => ({
  useAudioAnalyzer: () => ({
    getAudioData: vi.fn(),
    status: 'idle',
  }),
}));

vi.mock('../../src/utils/visualPreview', () => ({
  startVisualPreview: vi.fn(() => vi.fn()),
}));

import DemoPlayerPage from '../../src/pages/DemoPlayerPage';
import ExplorePage from '../../src/pages/ExplorePage';
import LandingPage from '../../src/pages/LandingPage';
import MyVisualsPage from '../../src/pages/MyVisualsPage';
import NotFoundPage from '../../src/pages/NotFoundPage';
import PlayerPage from '../../src/pages/PlayerPage';
import { Routes as RoutePaths } from '../../src/routes/paths';
import { useAuth } from '../../src/context/useAuth';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const guestAuth = {
  user: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateProfile: vi.fn(),
};

describe('basic pages', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue(guestAuth);
  });
  it('renders LandingPage', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/Transform Music Into Living Art/i)).toBeInTheDocument();
  });

  it('renders ExplorePage for authenticated users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: 'u1',
        name: 'Alex',
        email: 'alex@example.com',
        createdAt: '2026-01-01',
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateProfile: vi.fn(),
    });

    renderWithRouter(<ExplorePage />);

    expect(screen.getByRole('heading', { name: /Explore Visuals/i })).toBeInTheDocument();
  });

  it('renders DemoPlayerPage', async () => {
    render(
      <MemoryRouter initialEntries={['/visualizer/demo']}>
        <DemoPlayerPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Sonix home/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: /Sign Up to unlock all visualizers/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Explore$/i })).not.toBeInTheDocument();
  });

  it('renders PlayerPage', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: 'u1',
        name: 'Alex',
        email: 'alex@example.com',
        createdAt: '2026-01-01',
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/visualizer/visual123']}>
        <Routes>
          <Route path={RoutePaths.VISUALIZER} element={<PlayerPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Sonix home/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /Explore/i })).toBeInTheDocument();
  });

  it('renders MyVisualsPage', () => {
    renderWithRouter(<MyVisualsPage />);

    expect(screen.getByRole('heading', { name: /My Favorites/i })).toBeInTheDocument();
  });

  it('renders NotFoundPage', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText(/404/i)).toBeInTheDocument();

    expect(screen.getByText(/The page you are looking for/i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Go Home/i })).toHaveAttribute('href', '/');
  });
});
