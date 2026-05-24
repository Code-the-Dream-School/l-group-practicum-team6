import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ApiEndpoints } from '@sonix/shared';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateProfile = vi.fn();
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => ({
    user: {
      _id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    updateProfile: mockUpdateProfile,
    logout: mockLogout,
  }),
}));

vi.mock('../../src/components/NavBar', () => ({
  default: () => <div>NavBar</div>,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import SettingsPage from '../../src/pages/SettingsPage';

function renderPage() {
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset();
    mockLogout.mockReset();
    mockNavigate.mockReset();
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch');
  });

  it('renders profile fields and account controls', () => {
    renderPage();

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email Address')).toHaveValue('test@example.com');
    expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeInTheDocument();
  });

  it('shows an error when display name is empty on blur', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: '   ' } });
    fireEvent.blur(screen.getByLabelText('Display Name'));

    expect(await screen.findByText('Display name cannot be empty')).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('trims and saves a changed display name', async () => {
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    renderPage();

    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: '  New Name  ' } });
    fireEvent.blur(screen.getByLabelText('Display Name'));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'New Name' }));
    expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
  });

  it('shows password mismatch error and blocks submit', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current-pass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new-pass' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different-pass' },
    });
    fireEvent.blur(screen.getByLabelText('Confirm Password'));

    expect(
      await screen.findByText('New password and Confirm Password do not match')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Password' })).toBeDisabled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('updates password successfully', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    renderPage();

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current-pass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new-pass' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'new-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(ApiEndpoints.USER_PASSWORD, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: 'current-pass', newPassword: 'new-pass' }),
      });
    });

    expect(await screen.findByText('Password updated successfully.')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toHaveValue('');
    expect(screen.getByLabelText('New Password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm Password')).toHaveValue('');
  });

  it('deletes account, logs out, and navigates home on success', async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Current Password'), {
      target: { value: 'secret-pass' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Account' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(ApiEndpoints.USER, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: 'secret-pass' }),
      });
    });

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows API error when delete account fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Password is incorrect' } }),
    } as Response);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Current Password'), {
      target: { value: 'wrong-pass' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Account' }));

    expect(await screen.findByText('Password is incorrect')).toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
