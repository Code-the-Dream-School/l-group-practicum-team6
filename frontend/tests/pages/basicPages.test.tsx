import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
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
import { getAllShaders } from '../../src/utils/mockShaders';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('basic pages', () => {
  it('renders LandingPage', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/Transform Music Into Living Art/i)).toBeInTheDocument();
  });

  it('renders ExplorePage', () => {
    renderWithRouter(<ExplorePage />);

    expect(screen.getByRole('heading', { name: /Explore Visuals/i })).toBeInTheDocument();
  });

  it('renders DemoPlayerPage', () => {
    renderWithRouter(<DemoPlayerPage />);

    expect(screen.getByText(/Demo Player Page/i)).toBeInTheDocument();
  });

  it('renders PlayerPage', () => {
    const shaderId = getAllShaders()[0].id;

    render(
      <MemoryRouter initialEntries={[`/visualizer/${shaderId}`]}>
        <Routes>
          <Route path={RoutePaths.VISUALIZER} element={<PlayerPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Sonix home/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore/i })).toBeInTheDocument();
  });

  it('renders MyVisualsPage', () => {
    renderWithRouter(<MyVisualsPage />);

    expect(screen.getByRole('heading', { name: /My Favorites/i })).toBeInTheDocument();
  });

  it('renders NotFoundPage', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});
