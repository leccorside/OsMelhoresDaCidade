'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthCookies, clearAuthCookies } from '@/services/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN';
  isEmailVerified: boolean;
  merchantProfile?: {
    id: string;
    companyName: string;
    isApproved: boolean;
  } | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        setAuthCookies(accessToken, user.role);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        clearAuthCookies();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'os-melhores-auth-storage',
    },
  ),
);

/**
 * Função utilitária para recuperar o token JWT atual (Zustand ou cookie)
 */
export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const state = useAuthStore.getState();
    if (state.accessToken) return state.accessToken;

    // Fallback: ler do cookie
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === 'auth_token' && val) {
        return decodeURIComponent(val);
      }
    }
  } catch (err) {
    // ignore
  }

  return null;
}
