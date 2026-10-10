import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';
import { onSessionExpired, refreshSession, setAccessToken } from '../api/http';
import type { AuthResponse, LoginInput, RegisterInput, User } from '../types/api';
import { AuthContext, type AuthStatus } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const startSession = useCallback((data: AuthResponse) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const endSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    onSessionExpired(endSession);
    refreshSession().then(startSession, () => setStatus('anonymous'));
  }, [startSession, endSession]);

  const login = useCallback(
    async (input: LoginInput) => startSession(await authApi.login(input)),
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => startSession(await authApi.register(input)),
    [startSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      endSession();
    }
  }, [endSession]);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
