import { create } from 'zustand';

import { login as loginRequest } from '../../shared/api/endpoints/auth/auth.endpoints';
import type { AuthUser } from '../../shared/api/endpoints/auth/auth.types';

const ACCESS_TOKEN_KEY = 'accessToken';

export type User = AuthUser;

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isHydrated: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,
  hydrate: () => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const accessToken = token && token.trim().length > 0 ? token : null;

    set({
      accessToken,
      isHydrated: true
    });
  },
  login: async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    window.localStorage.setItem(ACCESS_TOKEN_KEY, response.token);

    set({
      accessToken: response.token,
      user: response.user,
      isHydrated: true
    });
  },
  logout: () => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);

    set({
      accessToken: null,
      user: null,
      isHydrated: true
    });
  }
}));
