import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import NavBar from '../../src/components/NavBar';

const authedUser = {
  _id: 'u1',
  name: 'Alex Doe',
  email: 'alex@example.com',
  createdAt: '2026-01-01',
};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>
  );
}

describe('NavBar', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockNavigate.mockReset();
  });

  describe('standard variant — guest', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });
    });

    it('shows Explore + Log In + Sign Up', () => {
      renderAt('/');
      expect(screen.getByRole('link', { name: 'Explore' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('does not show My Visuals', () => {
      renderAt('/');
      expect(screen.queryByRole('link', { name: 'My Visuals' })).not.toBeInTheDocument();
    });
  });

  describe('standard variant — authenticated', () => {
    it('shows Explore + My Visuals + avatar', () => {
      mockUseAuth.mockReturnValue({ user: authedUser, logout: vi.fn() });
      renderAt('/');
      expect(screen.getByRole('link', { name: 'Explore' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'My Visuals' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument();
    });

    it('opens dropdown with Settings (disabled) and Log Out', () => {
      mockUseAuth.mockReturnValue({ user: authedUser, logout: vi.fn() });
      renderAt('/');
      fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
      const settings = screen.getByRole('menuitem', { name: 'Settings' });
      expect(settings).toBeDisabled();
      expect(screen.getByRole('menuitem', { name: 'Log Out' })).toBeInTheDocument();
    });

    it('calls logout and redirects to /', async () => {
      const logout = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({ user: authedUser, logout });
      renderAt('/');

      fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Log Out' }));

      await Promise.resolve();
      await Promise.resolve();
      expect(logout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('minimal variant', () => {
    it('renders only logo on /login', () => {
      mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });
      renderAt('/login');
      expect(screen.queryByRole('link', { name: 'Explore' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Log In' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument();
    });

    it('renders only logo on /signup', () => {
      mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });
      renderAt('/signup');
      expect(screen.queryByRole('link', { name: 'Explore' })).not.toBeInTheDocument();
    });
  });

  describe('mobile drawer', () => {
    it('toggles drawer via hamburger button', () => {
      mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });
      renderAt('/');
      const hamburger = screen.getByRole('button', { name: 'Open menu' });
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(hamburger);
      expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });
  });
});
