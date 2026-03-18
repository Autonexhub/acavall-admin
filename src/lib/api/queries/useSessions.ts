'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Session, MonthlyStats } from '@/types/models';
import type { SessionFilters } from '@/types/api';

export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => apiClient.get<Session[]>(API_ENDPOINTS.sessions.list, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for sessions (more dynamic)
  });
}

export function useSession(id: number) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => apiClient.get<Session>(API_ENDPOINTS.sessions.get(id)),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSessionStats(filters?: SessionFilters) {
  return useQuery({
    queryKey: ['sessions', 'stats', filters],
    queryFn: () => apiClient.get<MonthlyStats>(API_ENDPOINTS.sessions.stats, filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Session>) =>
      apiClient.post<Session>(API_ENDPOINTS.sessions.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'stats'] });
    },
  });
}

export function useUpdateSession(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Session>) =>
      apiClient.put<Session>(API_ENDPOINTS.sessions.update(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'stats'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(API_ENDPOINTS.sessions.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'stats'] });
    },
  });
}
