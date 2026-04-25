import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/client', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../../src/api/client';
import { getUser, login, register, logout } from '../../src/api/auth';
import {
  listVisualizers,
  getDemoVisualizer,
  getVisualizer,
} from '../../src/api/visualizers';
import {
  updateProfile,
  changePassword,
  deleteAccount,
  getSavedVisuals,
  saveVisual,
  removeVisual,
} from '../../src/api/users';
import { uploadAvatar, deleteAvatar } from '../../src/api/images';

const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
});

describe('auth api', () => {
  it('getUser calls correct endpoint', () => {
    getUser();

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/auth/me');
  });

  it('login posts credentials', () => {
    login('test@example.com', 'password123');

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
  });

  it('register posts user data', () => {
    register('John', 'test@example.com', 'password123');

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'test@example.com',
        password: 'password123',
      }),
    });
  });

  it('logout posts to logout endpoint', () => {
    logout();

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
    });
  });
});

describe('visualizers api', () => {
  it('listVisualizers calls base endpoint without params', () => {
    listVisualizers();

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/visualizers');
  });

  it('listVisualizers includes query params', () => {
    listVisualizers({ search: 'wave', page: 1, limit: 10 });

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/visualizers?search=wave&page=1&limit=10'
    );
  });

  it('getDemoVisualizer calls demo endpoint', () => {
    getDemoVisualizer();

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/visualizers/demo');
  });

  it('getVisualizer calls visualizer by id endpoint', () => {
    getVisualizer('abc123');

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/visualizers/abc123');
  });
});

describe('users api', () => {
  it('updateProfile patches profile data', () => {
    updateProfile({ name: 'Bob' });

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Bob' }),
    });
  });

  it('changePassword patches password data', () => {
    changePassword({
      currentPassword: 'oldpass',
      newPassword: 'newpass',
    });

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/users/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      }),
    });
  });

  it('deleteAccount deletes account with password confirmation', () => {
    deleteAccount('password123');

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'password123' }),
    });
  });

  it('getSavedVisuals calls saved visuals endpoint', () => {
    getSavedVisuals();

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/users/saved-visuals');
  });

  it('saveVisual posts visual id', () => {
    saveVisual('visual123');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/users/saved-visuals/visual123',
      {
        method: 'POST',
      }
    );
  });

  it('removeVisual deletes saved visual id', () => {
    removeVisual('visual123');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/users/saved-visuals/visual123',
      {
        method: 'DELETE',
      }
    );
  });
});

describe('images api', () => {
  it('uploadAvatar sends FormData', () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    uploadAvatar(file);

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/images/avatar',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
  });

  it('deleteAvatar deletes avatar', () => {
    deleteAvatar();

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/images/avatar', {
      method: 'DELETE',
    });
  });
});