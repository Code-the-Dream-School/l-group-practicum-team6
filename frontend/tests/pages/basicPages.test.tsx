import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

import DemoPlayerPage from '../../src/pages/DemoPlayerPage';
import ExplorePage from '../../src/pages/ExplorePage';
import LandingPage from '../../src/pages/LandingPage';
import MyVisualsPage from '../../src/pages/MyVisualsPage';
import NotFoundPage from '../../src/pages/NotFoundPage';
import PlayerPage from '../../src/pages/PlayerPage';

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
    renderWithRouter(<PlayerPage />);

    expect(screen.getByText(/Player Page/i)).toBeInTheDocument();
  });

  it('renders MyVisualsPage', () => {
    renderWithRouter(<MyVisualsPage />);

    expect(screen.getByRole('heading', { name: /My Visuals/i })).toBeInTheDocument();
  });

  it('renders NotFoundPage', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});
