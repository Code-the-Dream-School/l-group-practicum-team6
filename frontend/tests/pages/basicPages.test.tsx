import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/components/NavBar', () => ({
  default: () => <div>NavBar</div>,
}));

vi.mock('../../src/components/Footer', () => ({
  default: () => <div>Footer</div>,
}));

vi.mock('../../src/context/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../../src/api/visualizers', () => ({
  listVisualizers: vi.fn().mockResolvedValue({ data: { visualizers: [] } }),
}));

vi.mock('../../src/utils/visualPreview', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/visualPreview')>();

  return {
    ...actual,
    startVisualPreview: vi.fn(() => vi.fn()),
  };
});

vi.mock('../../src/hooks/useAudioAnalyzer', () => ({
  useAudioAnalyzer: vi.fn(() => ({
    getAudioData: vi.fn(() => new Uint8Array(128)),
    status: 'idle',
  })),
}));

import DemoPlayerPage from '../../src/pages/DemoPlayerPage';
import ExplorePage from '../../src/pages/ExplorePage';
import LandingPage from '../../src/pages/LandingPage';
import MyVisualsPage from '../../src/pages/MyVisualsPage';
import NotFoundPage from '../../src/pages/NotFoundPage';
import PlayerPage from '../../src/pages/PlayerPage';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('basic pages', () => {
  it('renders LandingPage', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText('NavBar')).toBeInTheDocument();
    expect(screen.getByText(/Transform Music Into Living Art/i)).toBeInTheDocument();
  });

  it('renders ExplorePage', () => {
    renderWithRouter(<ExplorePage />);
    expect(screen.getByText('NavBar')).toBeInTheDocument();
    expect(screen.getByText('Explore Visuals')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders DemoPlayerPage', () => {
    render(<DemoPlayerPage />);
    expect(screen.getByText('Demo Player Page')).toBeInTheDocument();
  });

  it('renders PlayerPage without a visual id', () => {
    renderWithRouter(<PlayerPage />);
    expect(screen.getByText('NavBar')).toBeInTheDocument();
  });

  it('renders PlayerPage with a mock visual id', () => {
    render(
      <MemoryRouter initialEntries={['/visualizer/66d0d6ee7912e0c7d88ce305']}>
        <Routes>
          <Route path="/visualizer/:id" element={<PlayerPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('NavBar')).toBeInTheDocument();
  });

  it('renders MyVisualsPage', () => {
    renderWithRouter(<MyVisualsPage />);
    expect(screen.getByText('My Visuals')).toBeInTheDocument();
  });

  it('renders NotFoundPage', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });
});
