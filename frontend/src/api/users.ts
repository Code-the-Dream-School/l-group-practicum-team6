import { ApiEndpoints, type ApiResponse, type User, type Visualizer } from '@sonix/shared';
import { apiFetch } from './client';
import { buildSavedVisualEndpoint } from './endpoints';

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
  return apiFetch<ApiResponse<UserData>>(ApiEndpoints.USER_ME, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(ApiEndpoints.USER_ME_PASSWORD, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAccount(password: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(ApiEndpoints.USER_ME, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

export function getSavedVisuals(): Promise<ApiResponse<SavedVisualsData>> {
  return apiFetch<ApiResponse<SavedVisualsData>>(ApiEndpoints.USER_VISUALS);
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
