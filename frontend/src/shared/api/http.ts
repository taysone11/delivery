import axios, { type InternalAxiosRequestConfig } from 'axios';

import { normalizeApiError } from './errors';
import { getAccessToken } from './getAccessToken';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error))
);
