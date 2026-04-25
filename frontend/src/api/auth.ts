import type { ApiResponse, User} from '@sonix/shared';
import { apiFetch } from './client';

type AuthData = {
  user: User;
  token: string;
};

export function getUser(): Promise<ApiResponse<AuthData>> {
  return apiFetch<ApiResponse<AuthData>>('/api/auth/me');
}

export function login(email: string, password: string): Promise<ApiResponse<AuthData>> {
  return apiFetch<ApiResponse<AuthData>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  name: string, 
  email: string, 
  password: string
): Promise<ApiResponse<AuthData>> {
  return apiFetch<ApiResponse<AuthData>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/api/auth/logout', {
    method: 'POST',
  });
}