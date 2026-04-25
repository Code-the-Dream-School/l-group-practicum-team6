import type { ApiResponse, User } from "@sonix/shared";
import { apiFetch } from "./client";

export function uploadAvatar(file: File): Promise<ApiResponse<User>> {
  const formData = new FormData();
  formData.append('avatar', file);

  return apiFetch<ApiResponse<User>>('/api/images/avatar', {
    method: 'POST',
    body: formData,
  });
}

export function deleteAvatar(): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>('/api/images/avatar', {
    method: 'DELETE',
  });
}