'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { WorkHistory } from '@/types/models';

export function useWorkHistory(therapistId: number) {
  return useQuery({
    queryKey: ['work-history', therapistId],
    queryFn: () => apiClient.get<WorkHistory[]>(`/therapists/${therapistId}/work-history`),
    enabled: !!therapistId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWorkHistory(therapistId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkHistory>) =>
      apiClient.post<WorkHistory>(`/therapists/${therapistId}/work-history`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-history', therapistId] });
      queryClient.invalidateQueries({ queryKey: ['therapists', therapistId] });
    },
  });
}

export function useUpdateWorkHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkHistory> }) =>
      apiClient.put<WorkHistory>(`/work-history/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-history'] });
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });
}

export function useDeleteWorkHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/work-history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-history'] });
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });
}
