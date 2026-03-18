'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { User, LoginCredentials, AuthResponse } from '@/types/auth';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => apiClient.get<User>(API_ENDPOINTS.auth.me),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials),
    onSuccess: (data) => {
      // Store user in cache
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.auth.logout),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Redirect to login handled by middleware
    },
  });
}
