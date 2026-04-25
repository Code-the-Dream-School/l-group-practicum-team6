import type { ApiResponse, User, Visualizer } from '@sonix/shared';
import { apiFetch } from './client';

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
  return apiFetch<ApiResponse<UserData>>('/api/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>('/api/users/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAccount(password: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>('/api/users/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

export function getSavedVisuals(): Promise<ApiResponse<SavedVisualsData>> {
  return apiFetch<ApiResponse<SavedVisualsData>>('/api/users/saved-visuals');
}

export function saveVisual(id: string): Promise<ApiResponse<SavedVisualsData>> {
  return apiFetch<ApiResponse<SavedVisualsData>>(`/api/users/saved-visuals/${id}`, {
    method: 'POST',
  });
}

export function removeVisual(id: string): Promise<ApiResponse<SavedVisualsData>> {
  return apiFetch<ApiResponse<SavedVisualsData>>(`/api/users/saved-visuals/${id}`, {
    method: 'DELETE',
  });
}
