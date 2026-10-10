import axios, { AxiosError } from 'axios';
import type { AuthResponse } from '../types/api';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retried?: boolean;
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15_000,
});

let accessToken: string | null = null;
let pendingRefresh: Promise<AuthResponse> | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler;
}

export function refreshSession(): Promise<AuthResponse> {
  pendingRefresh ??= http
    .post<AuthResponse>('/auth/refresh', undefined, { skipAuthRefresh: true })
    .then(({ data }) => {
      accessToken = data.accessToken;
      return data;
    })
    .finally(() => {
      pendingRefresh = null;
    });
  return pendingRefresh;
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config;
  if (error.response?.status !== 401 || !config || config.skipAuthRefresh || config._retried) {
    throw error;
  }

  try {
    await refreshSession();
  } catch {
    accessToken = null;
    sessionExpiredHandler?.();
    throw error;
  }

  config._retried = true;
  return http(config);
});
