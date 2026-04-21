import React, { createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useImpersonate,
  useStopImpersonating
} from '@/lib/api/queries/useAuth';
import type { AuthContextType, LoginCredentials } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const impersonateMutation = useImpersonate();
  const stopImpersonatingMutation = useStopImpersonating();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginMutation.mutateAsync(credentials);
      // Redirect based on user role
      if (response.user.role === 'therapist') {
        navigate('/my-sessions');
      } else {
        navigate('/dashboard');
      }
    },
    [loginMutation, navigate]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    navigate('/login');
  }, [logoutMutation, navigate]);

  const impersonate = useCallback(
    async (userId: number) => {
      await impersonateMutation.mutateAsync(userId);
      // Navigate based on impersonated user's role
      const impersonatedUser = user;
      if (impersonatedUser?.role === 'therapist') {
        navigate('/my-sessions');
      } else {
        navigate('/dashboard');
      }
    },
    [impersonateMutation, navigate, user]
  );

  const stopImpersonating = useCallback(async () => {
    await stopImpersonatingMutation.mutateAsync();
    navigate('/users');
  }, [stopImpersonatingMutation, navigate]);

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending ||
               impersonateMutation.isPending || stopImpersonatingMutation.isPending,
    isAuthenticated: !!user,
    isImpersonating: !!(user?.impersonator),
    login,
    logout,
    impersonate,
    stopImpersonating,
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
