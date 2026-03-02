import { create } from 'zustand';

import { login as loginRequest, register as registerRequest } from '../../shared/api/endpoints/auth/auth.endpoints';
import type { AuthUser } from '../../shared/api/endpoints/auth/auth.types';

const ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_USER_KEY = 'authUser';

export type User = AuthUser;

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isHydrated: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,
  hydrate: () => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const accessToken = token && token.trim().length > 0 ? token : null;
    const serializedUser = window.localStorage.getItem(AUTH_USER_KEY);

    let user: User | null = null;
    if (serializedUser) {
      try {
        user = JSON.parse(serializedUser) as User;
      } catch {
        user = null;
      }
    }

    const hydratedUser = accessToken ? user : null;
    if (!accessToken) {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }

    set({
      accessToken,
      user: hydratedUser,
      isHydrated: true
    });
  },
  login: async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    window.localStorage.setItem(ACCESS_TOKEN_KEY, response.token);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

    set({
      accessToken: response.token,
      user: response.user,
      isHydrated: true
    });
  },
  register: async (payload) => {
    const response = await registerRequest(payload);
    window.localStorage.setItem(ACCESS_TOKEN_KEY, response.token);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

    set({
      accessToken: response.token,
      user: response.user,
      isHydrated: true
    });
  },
  logout: () => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);

    set({
      accessToken: null,
      user: null,
      isHydrated: true
    });
  }
}));
