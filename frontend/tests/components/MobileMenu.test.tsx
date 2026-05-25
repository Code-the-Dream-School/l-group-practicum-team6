import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { MobileMenu } from '../../src/components/NavBar/MobileMenu';

const authedUser = {
  _id: 'u1',
  name: 'Alex Doe',
  email: 'alex@example.com',
  createdAt: '2026-01-01',
};

function renderMenu({
  user = null,
  path = '/',
  onLogout = vi.fn().mockResolvedValue(undefined),
}: {
  user?: typeof authedUser | null;
  path?: string;
  onLogout?: () => Promise<void>;
} = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MobileMenu user={user} onLogout={onLogout} />
    </MemoryRouter>
  );
}

describe('MobileMenu', () => {
  describe('guest', () => {
    it('shows stacked auth links without explore nav', () => {
      renderMenu();

      expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
      expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup');
      expect(screen.queryByRole('link', { name: 'Explore' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'My Visuals' })).not.toBeInTheDocument();
    });
  });

  describe('authenticated', () => {
    it('shows explore and my visuals links', () => {
      renderMenu({ user: authedUser });

      expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/explore');
      expect(screen.getByRole('link', { name: 'My Visuals' })).toHaveAttribute(
        'href',
        '/my-visuals'
      );
    });

    it('highlights the active route link', () => {
      renderMenu({ user: authedUser, path: '/explore' });

      expect(screen.getByRole('link', { name: 'Explore' })).toHaveClass('text-text-primary');
      expect(screen.getByRole('link', { name: 'My Visuals' })).toHaveClass('text-text-secondary');
    });

    it('highlights my visuals when on that route', () => {
      renderMenu({ user: authedUser, path: '/my-visuals' });

      expect(screen.getByRole('link', { name: 'Explore' })).toHaveClass('text-text-secondary');
      expect(screen.getByRole('link', { name: 'My Visuals' })).toHaveClass('text-text-primary');
    });

    it('shows avatar initial and user name', () => {
      renderMenu({ user: authedUser });

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('Alex Doe')).toBeInTheDocument();
    });

    it('renders settings link', () => {
      renderMenu({ user: authedUser });

      expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
    });

    it('calls onLogout when log out is clicked', async () => {
      const onLogout = vi.fn().mockResolvedValue(undefined);
      renderMenu({ user: authedUser, onLogout });

      fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));

      await Promise.resolve();
      expect(onLogout).toHaveBeenCalledTimes(1);
    });
  });
});
