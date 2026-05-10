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

type SavedVisualsData = {
  visuals: Visualizer[];
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

export function getSavedVisuals(): Promise<ApiResponse<SavedVisualsData>> {
  return apiFetch<ApiResponse<SavedVisualsData>>(ApiEndpoints.USERS_SAVED_VISUALS);
}

export function saveVisual(id: string): Promise<ApiResponse<SavedVisualsData>> {
  return apiFetch<ApiResponse<SavedVisualsData>>(buildSavedVisualEndpoint(id), {
    method: 'POST',
  });
}

export function removeVisual(id: string): Promise<ApiResponse<SavedVisualsData>> {
  return apiFetch<ApiResponse<SavedVisualsData>>(buildSavedVisualEndpoint(id), {
    method: 'DELETE',
  });
}
