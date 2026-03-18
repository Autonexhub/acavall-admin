'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Project } from '@/types/models';

interface UseProjectsParams {
  page?: number;
  perPage?: number;
}

export function useProjects(params?: UseProjectsParams) {
  const { page = 1, perPage = 50 } = params || {};

  return useQuery({
    queryKey: ['projects', { page, perPage }],
    queryFn: () => apiClient.get<Project[]>(`${API_ENDPOINTS.projects.list}?page=${page}&per_page=${perPage}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => apiClient.get<Project>(API_ENDPOINTS.projects.get(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Project>) =>
      apiClient.post<Project>(API_ENDPOINTS.projects.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Project>) =>
      apiClient.put<Project>(API_ENDPOINTS.projects.update(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(API_ENDPOINTS.projects.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
