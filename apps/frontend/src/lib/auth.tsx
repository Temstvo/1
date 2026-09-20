'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { apiErrorMessage } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status: string;
  profile?: { firstName?: string; lastName?: string } | null;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let last: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      last = e;
      const net = !e?.response || e?.code === 'ERR_NETWORK' || e?.code === 'ECONNABORTED';
      if (!net || i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw last;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await withRetry(() => api.get('/users/me'));
      setUser(data?.user ?? data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const { data } = await withRetry(() => api.post('/auth/login', { email, password }));
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user ?? null);
        if (!data.user) await refreshUser();
      } catch (e: any) {
        const msg = apiErrorMessage(e, 'Не удалось войти');
        setError(msg);
        throw new Error(msg);
      }
    },
    [refreshUser],
  );

  const register = useCallback(
    async (email: string, password: string, firstName?: string) => {
      setError(null);
      try {
        const { data } = await withRetry(() =>
          api.post('/auth/register', { email, password, firstName }),
        );
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user ?? null);
        if (!data.user) await refreshUser();
      } catch (e: any) {
        const msg = apiErrorMessage(e, 'Не удалось зарегистрироваться');
        setError(msg);
        throw new Error(msg);
      }
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore — чистим локально в любом случае */
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, error, login, register, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`.replace(
    /[^a-zA-Z0-9_-]/g,
    'x',
  );
}
