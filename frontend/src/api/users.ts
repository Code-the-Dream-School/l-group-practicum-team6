import type { ApiResponse, User, Visualizer } from '@sonix/shared';
import { apiFetch } from './client';
import { ApiEndpoints, buildSavedVisualEndpoint } from './endpoints';

type UpdateProfileData = {
  name?: string;
  email?: string;
};

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

type UserData = {
  user: User;
};

export type SavedVisual = {
  _id: string;
  userId: string;
  visualizerId: Visualizer;
  createdAt: string;
  updatedAt: string;
};

export function updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserData>> {
  return apiFetch<ApiResponse<UserData>>(ApiEndpoints.USERS_PROFILE, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(ApiEndpoints.USERS_PASSWORD, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAccount(password: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(ApiEndpoints.USERS_ACCOUNT, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

export function getSavedVisuals(): Promise<ApiResponse<SavedVisual[]>> {
  return apiFetch<ApiResponse<SavedVisual[]>>(ApiEndpoints.USERS_SAVED_VISUALS);
}

export function saveVisual(id: string): Promise<ApiResponse<SavedVisual>> {
  return apiFetch<ApiResponse<SavedVisual>>(buildSavedVisualEndpoint(id), {
    method: 'POST',
  });
}

export function removeVisual(id: string): Promise<{ msg: string }> {
  return apiFetch<{ msg: string }>(buildSavedVisualEndpoint(id), {
    method: 'DELETE',
  });
}
