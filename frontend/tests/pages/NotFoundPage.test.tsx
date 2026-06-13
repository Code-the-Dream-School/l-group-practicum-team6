import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, expect, it } from 'vitest';

import NotFoundPage from '../../src/pages/NotFoundPage';

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../../src/context/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

function renderNotFoundPage(state?: { message?: string }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/404', state }]}>
      <Routes>
        <Route path="/404" element={<NotFoundPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('NotFoundPage', () => {
  it('renders default 404 content and navigation links', () => {
    renderNotFoundPage();

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /the page you are looking for/i })
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /explore visuals/i })).toHaveAttribute(
      'href',
      '/explore'
    );
  });

  it('renders a custom message from location state', () => {
    renderNotFoundPage({ message: 'Visualizer not found' });

    expect(screen.getByRole('heading', { name: /visualizer not found/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /doesn't exist/i })).not.toBeInTheDocument();
  });

  it('does not show team and mentor links by default', () => {
    renderNotFoundPage();

    expect(screen.queryByText('Team')).not.toBeInTheDocument();
    expect(screen.queryByText('Mentors')).not.toBeInTheDocument();
    expect(screen.queryByText('Olesia Mironenko')).not.toBeInTheDocument();
  });

  it('shows team and mentor links when clicking 404', async () => {
    const user = userEvent.setup();

    renderNotFoundPage();

    await user.click(screen.getByText('404'));

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Mentors')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /olesia mironenko/i })).toHaveAttribute(
      'href',
      'https://github.com/olesiamironenko'
    );

    expect(screen.getByRole('link', { name: /sergey sherstobitov/i })).toHaveAttribute(
      'href',
      'https://github.com/in43sh'
    );
  });

  it('hides team and mentor links when clicking 404 again', async () => {
    const user = userEvent.setup();

    renderNotFoundPage();

    const heading404 = screen.getByText('404');

    await user.click(heading404);
    expect(screen.getByText('Team')).toBeInTheDocument();

    await user.click(heading404);
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
    expect(screen.queryByText('Mentors')).not.toBeInTheDocument();
  });
});
