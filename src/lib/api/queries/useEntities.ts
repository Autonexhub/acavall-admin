'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Entity, PaginatedResponse } from '@/types/models';

interface UseEntitiesParams {
  search?: string;
  page?: number;
  perPage?: number;
}

export function useEntities(params?: UseEntitiesParams) {
  const { search = '', page = 1, perPage = 18 } = params || {};

  return useQuery({
    queryKey: ['entities', { search, page, perPage }],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      queryParams.append('page', page.toString());
      queryParams.append('per_page', perPage.toString());

      const url = `${API_ENDPOINTS.entities.list}?${queryParams.toString()}`;
      return apiClient.get<PaginatedResponse<Entity>>(url);
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useEntity(id: number) {
  return useQuery({
    queryKey: ['entities', id],
    queryFn: () => apiClient.get<Entity>(API_ENDPOINTS.entities.get(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Entity>) =>
      apiClient.post<Entity>(API_ENDPOINTS.entities.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });
}

export function useUpdateEntity(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Entity>) =>
      apiClient.put<Entity>(API_ENDPOINTS.entities.update(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      queryClient.invalidateQueries({ queryKey: ['entities', id] });
    },
  });
}

export function useDeleteEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(API_ENDPOINTS.entities.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });
}
