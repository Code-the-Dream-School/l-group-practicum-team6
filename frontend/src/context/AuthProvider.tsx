import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ApiResponse, User } from '@sonix/shared';
import type { AuthContextValue } from './auth-context';

import { ApiEndpoints } from '@sonix/shared';
import { AuthContext } from './auth-context';

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    const msg = body?.error?.message;
    return typeof msg === 'string' && msg.length > 0 ? msg : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const res = await fetch(ApiEndpoints.USER, {
          credentials: 'include',
        });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const body = (await res.json()) as ApiResponse<User>;
        if (!cancelled) setUser(body?.data ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(ApiEndpoints.AUTH_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(await readApiError(res, 'Login failed'));
    }
    const body = (await res.json()) as ApiResponse<User>;
    if (!body.data) throw new Error('Invalid login response');
    setUser(body.data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(ApiEndpoints.AUTH_REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      throw new Error(await readApiError(res, 'Registration failed'));
    }
    const body = (await res.json()) as ApiResponse<User>;
    if (!body.data) throw new Error('Invalid registration response');
    setUser(body.data);
  }, []);

  const updateProfile = useCallback(async (payload: { name?: string; email?: string }) => {
    const res = await fetch(ApiEndpoints.USER, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Profile update failed'));
    }

    const body = (await res.json()) as ApiResponse<User>;
    if (!body.data) throw new Error('Invalid profile update response');
    setUser(body.data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(ApiEndpoints.AUTH_LOGOUT, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Failed to logout', e);
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, loading, login, register, updateProfile, logout]
  );

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7C5CFC] border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
