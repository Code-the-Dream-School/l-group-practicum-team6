import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../src/App';
import { AuthProvider } from '../src/context/AuthProvider';

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: false,
    json: async () => ({}),
  } as Response);
});

function renderApp() {
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

describe('App', () => {
  it('renders landing page', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/Transform Music Into Living Art/i)).toBeInTheDocument();
    });
  });

  it('renders CTA links with correct routes', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Try the Demo/i })).toHaveAttribute(
        'href',
        '/visualizer/demo'
      );
    });

    expect(screen.getByRole('link', { name: /Get Started Free/i })).toHaveAttribute(
      'href',
      '/signup'
    );
  });

  it('renders feature cards', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/Real-time Visuals/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Microphone Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Playlist Collections/i)).toBeInTheDocument();
  });
});
