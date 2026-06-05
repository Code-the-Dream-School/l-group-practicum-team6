import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { API_ROUTES } from '@sonix/shared';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateProfile = vi.fn();
const mockLogout = vi.fn();
const mockNavigate = vi.fn();
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

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

vi.mock('../../src/context/useToast', () => ({
  useToast: () => mockToast,
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
    mockToast.success.mockReset();
    mockToast.error.mockReset();
    mockToast.info.mockReset();
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

  it('shows a toast error when display name is empty on blur', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: '   ' } });
    fireEvent.blur(screen.getByLabelText('Display Name'));

    expect(mockToast.error).toHaveBeenCalledWith('Display name cannot be empty');
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('trims and saves a changed display name', async () => {
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    renderPage();

    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: '  New Name  ' } });
    fireEvent.blur(screen.getByLabelText('Display Name'));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'New Name' }));
    expect(mockToast.success).toHaveBeenCalledWith('Profile updated successfully.');
  });

  it('shows password mismatch toast and blocks submit', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current-pass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new-pass' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different-pass' },
    });
    fireEvent.blur(screen.getByLabelText('Confirm Password'));

    expect(mockToast.error).toHaveBeenCalledWith('New password and Confirm Password do not match');
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
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [passwordUrl, passwordRequest] = vi.mocked(global.fetch).mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(passwordUrl).toBe(API_ROUTES.USER_PASSWORD);
    expect(passwordRequest).toEqual(
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({ currentPassword: 'current-pass', newPassword: 'new-pass' }),
      })
    );
    expect(passwordRequest.headers).toBeInstanceOf(Headers);
    expect((passwordRequest.headers as Headers).get('Content-Type')).toBe('application/json');

    expect(mockToast.success).toHaveBeenCalledWith('Password updated successfully.');
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
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [deleteUrl, deleteRequest] = vi.mocked(global.fetch).mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(deleteUrl).toBe(API_ROUTES.USER);
    expect(deleteRequest).toEqual(
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify({ password: 'secret-pass' }),
      })
    );
    expect(deleteRequest.headers).toBeInstanceOf(Headers);
    expect((deleteRequest.headers as Headers).get('Content-Type')).toBe('application/json');

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

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Password is incorrect');
    });
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
