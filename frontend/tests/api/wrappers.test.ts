import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/client', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../../src/api/client';
import { getUser, login, register, logout } from '../../src/api/auth';
import { listVisualizers, getDemoVisualizer, getVisualizer } from '../../src/api/visualizers';
import {
  updateProfile,
  changePassword,
  deleteAccount,
  getSavedVisuals,
  saveVisual,
  removeVisual,
} from '../../src/api/users';
import {
  uploadAvatar,
  deleteAvatar,
  uploadVisualizerImage,
  deleteVisualizerImage,
} from '../../src/api/images';
import {
  ApiEndpoints,
  buildVisualizerDetailEndpoint,
  buildSavedVisualEndpoint,
  buildVisualizerImageEndpoint,
} from '../../src/api';

const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
});

describe('auth api', () => {
  it('getUser calls correct endpoint', () => {
    getUser();

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.AUTH_USER);
  });

  it('login posts credentials', () => {
    login('test@example.com', 'password123');

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
  });

  it('register posts user data', () => {
    register('John', 'test@example.com', 'password123');

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.AUTH_REGISTER, {
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

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.AUTH_LOGOUT, {
      method: 'POST',
    });
  });
});

describe('visualizers api', () => {
  it('listVisualizers calls base endpoint without params', () => {
    listVisualizers();

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.VISUALIZERS);
  });

  it('listVisualizers skips undefined params', () => {
    listVisualizers({ search: 'wave', page: undefined, limit: 10 });

    expect(mockedApiFetch).toHaveBeenCalledWith(`${ApiEndpoints.VISUALIZERS}?search=wave&limit=10`);
  });

  it('listVisualizers returns base endpoint when all params are undefined', () => {
    listVisualizers({
      search: undefined,
      page: undefined,
      limit: undefined,
    });

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.VISUALIZERS);
  });

  it('listVisualizers includes query params', () => {
    listVisualizers({ search: 'wave', page: 1, limit: 10 });

    expect(mockedApiFetch).toHaveBeenCalledWith(
      `${ApiEndpoints.VISUALIZERS}?search=wave&page=1&limit=10`
    );
  });

  it('getDemoVisualizer calls demo endpoint', () => {
    getDemoVisualizer();

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.VISUALIZERS_DEMO);
  });

  it('getVisualizer calls visualizer by id endpoint', () => {
    getVisualizer('visual123');

    expect(mockedApiFetch).toHaveBeenCalledWith(buildVisualizerDetailEndpoint('visual123'));
  });
});

describe('users api', () => {
  it('updateProfile patches profile data', () => {
    updateProfile({ name: 'Bob' });

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.USERS_PROFILE, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Bob' }),
    });
  });

  it('changePassword patches password data', () => {
    changePassword({
      currentPassword: 'oldpass',
      newPassword: 'newpass',
    });

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.USERS_PASSWORD, {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      }),
    });
  });

  it('deleteAccount deletes account with password confirmation', () => {
    deleteAccount('password123');

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.USERS_ACCOUNT, {
      method: 'DELETE',
      body: JSON.stringify({ password: 'password123' }),
    });
  });

  it('getSavedVisuals calls saved visuals endpoint', () => {
    getSavedVisuals();

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.USERS_SAVED_VISUALS);
  });

  it('saveVisual posts visual id', () => {
    saveVisual('visual123');

    expect(mockedApiFetch).toHaveBeenCalledWith(buildSavedVisualEndpoint('visual123'), {
      method: 'POST',
    });
  });

  it('removeVisual deletes saved visual id', () => {
    removeVisual('visual123');

    expect(mockedApiFetch).toHaveBeenCalledWith(buildSavedVisualEndpoint('visual123'), {
      method: 'DELETE',
    });
  });
});

describe('images api', () => {
  it('uploadAvatar sends FormData', () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    uploadAvatar(file);

    expect(mockedApiFetch).toHaveBeenCalledWith(
      ApiEndpoints.IMAGES_AVATAR,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
  });

  it('deleteAvatar deletes avatar', () => {
    deleteAvatar();

    expect(mockedApiFetch).toHaveBeenCalledWith(ApiEndpoints.IMAGES_AVATAR, {
      method: 'DELETE',
    });
  });

  it('uploadVisualizerImage uploads image for visualizer', () => {
    const file = new File(['image'], 'visual.png', { type: 'image/png' });

    uploadVisualizerImage('visual123', file);

    expect(mockedApiFetch).toHaveBeenCalledWith(
      buildVisualizerImageEndpoint('visual123'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
  });

  it('deleteVisualizerImage deletes image for visualizer', () => {
    deleteVisualizerImage('visual123');

    expect(mockedApiFetch).toHaveBeenCalledWith(buildVisualizerImageEndpoint('visual123'), {
      method: 'DELETE',
    });
  });
});
