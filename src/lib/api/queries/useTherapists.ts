'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Therapist } from '@/types/models';

export function useTherapists() {
  return useQuery({
    queryKey: ['therapists'],
    queryFn: () => apiClient.get<Therapist[]>(API_ENDPOINTS.therapists.list),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTherapist(id: number) {
  return useQuery({
    queryKey: ['therapists', id],
    queryFn: () => apiClient.get<Therapist>(API_ENDPOINTS.therapists.get(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTherapist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Therapist>) =>
      apiClient.post<Therapist>(API_ENDPOINTS.therapists.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });
}

export function useUpdateTherapist(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Therapist>) =>
      apiClient.put<Therapist>(API_ENDPOINTS.therapists.update(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      queryClient.invalidateQueries({ queryKey: ['therapists', id] });
    },
  });
}

export function useDeleteTherapist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(API_ENDPOINTS.therapists.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });
}
