import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuth = vi.fn();

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

import GuestRoute from '../../src/routes/GuestRoute';
import ProtectedRoute from '../../src/routes/ProtectedRoute';
import AdminRoute from '../../src/routes/AdminRoute';

describe('route guards', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('GuestRoute renders children for guests', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <GuestRoute>
          <div>guest child</div>
        </GuestRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('guest child')).toBeInTheDocument();
  });

  it('GuestRoute redirects authenticated users to explore', () => {
    mockUseAuth.mockReturnValue({
      user: { _id: '1', name: 'Sam', email: 'sam@test.com', createdAt: 'now' },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <GuestRoute>
          <div>guest child</div>
        </GuestRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('guest child')).not.toBeInTheDocument();
  });

  it('ProtectedRoute redirects guests to login', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={['/explore']}>
        <ProtectedRoute>
          <div>secret content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('ProtectedRoute renders children for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: { _id: '1', name: 'Sam', email: 'sam@test.com', createdAt: 'now' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>secret content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('AdminRoute redirects guests to login', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={['/admin/visualizers']}>
        <AdminRoute>
          <div>admin content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('admin content')).not.toBeInTheDocument();
  });

  it('AdminRoute shows forbidden page for authenticated non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: {
        _id: '1',
        name: 'Sam',
        email: 'sam@test.com',
        createdAt: 'now',
        isAdmin: false,
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/visualizers']}>
        <AdminRoute>
          <div>admin content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('admin content')).not.toBeInTheDocument();
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
    expect(screen.getByText('Error 403')).toBeInTheDocument();
  });

  it('AdminRoute renders children for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: {
        _id: '1',
        name: 'Sam',
        email: 'sam@test.com',
        createdAt: 'now',
        isAdmin: true,
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/visualizers']}>
        <AdminRoute>
          <div>admin content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('admin content')).toBeInTheDocument();
  });
});
