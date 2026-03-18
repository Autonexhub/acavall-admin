'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Program } from '@/types/models';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => apiClient.get<Program[]>(API_ENDPOINTS.programs.list),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProgram(id: number) {
  return useQuery({
    queryKey: ['programs', id],
    queryFn: () => apiClient.get<Program>(API_ENDPOINTS.programs.get(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProgramStats(year?: number) {
  return useQuery({
    queryKey: ['programs', 'stats', year],
    queryFn: () => apiClient.get(API_ENDPOINTS.programs.stats, { year }),
    staleTime: 10 * 60 * 1000,
  });
}
