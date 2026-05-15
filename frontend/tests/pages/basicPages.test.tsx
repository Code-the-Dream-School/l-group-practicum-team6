import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/components/NavBar', () => ({
  default: () => <div>NavBar</div>,
}));

vi.mock('../../src/components/Footer', () => ({
  default: () => <div>Footer</div>,
}));

vi.mock('../../src/api', () => ({
  getSavedVisuals: vi.fn().mockResolvedValue({ data: [] }),
  removeVisual: vi.fn(),
}));

import DemoPlayerPage from '../../src/pages/DemoPlayerPage';
import ExplorePage from '../../src/pages/ExplorePage';
import LandingPage from '../../src/pages/LandingPage';
import MyVisualsPage from '../../src/pages/MyVisualsPage';
import NotFoundPage from '../../src/pages/NotFoundPage';
import PlayerPage from '../../src/pages/PlayerPage';

describe('basic pages', () => {
  it('renders LandingPage', () => {
    render(<LandingPage />);
    expect(screen.getByText('NavBar')).toBeInTheDocument();
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders ExplorePage', () => {
    render(<ExplorePage />);
    expect(screen.getByText('NavBar')).toBeInTheDocument();
    expect(screen.getByText('Explore Page')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders DemoPlayerPage', () => {
    render(<DemoPlayerPage />);
    expect(screen.getByText('Demo Player Page')).toBeInTheDocument();
  });

  it('renders PlayerPage', () => {
    render(<PlayerPage />);
    expect(screen.getByText('Player Page')).toBeInTheDocument();
  });

  it('renders MyVisualsPage', async () => {
    render(<MyVisualsPage />);
    expect(screen.getByText('My Visuals')).toBeInTheDocument();
    expect(await screen.findByText("You haven't saved any visualizers yet.")).toBeInTheDocument();
  });

  it('renders NotFoundPage', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });
});
