import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../src/context/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
}));

import App from '../src/App';

describe('App', () => {
  test('renders landing page', () => {
    render(<App />);

    expect(screen.getByText(/Music Made Visible/i)).toBeInTheDocument();
  });

  test('renders CTA links with correct routes', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /Try the Demo/i })).toHaveAttribute(
      'href',
      '/visualizer/demo'
    );

    expect(screen.getByRole('link', { name: /Get Started Free/i })).toHaveAttribute(
      'href',
      '/signup'
    );
  });

  test('renders feature cards', () => {
    render(<App />);

    expect(screen.getByText(/Microphone Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Playlist Collections/i)).toBeInTheDocument();
  });
});
