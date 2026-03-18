import React, { createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogin, useLogout } from '@/lib/api/queries/useAuth';
import type { AuthContextType, LoginCredentials } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
      navigate('/dashboard');
    },
    [loginMutation, navigate]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    navigate('/login');
  }, [logoutMutation, navigate]);

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
