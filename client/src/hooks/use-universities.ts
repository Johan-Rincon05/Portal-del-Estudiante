import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface University {
  id: number;
  name: string;
  createdAt: string;
}

export interface Program {
  id: number;
  universityId: number;
  name: string;
  isConvention: boolean;
  createdAt: string;
}

export function useUniversities() {
  return useQuery<University[]>({
    queryKey: ['universities'],
    queryFn: () => api.get('/api/universities').then(res => res.data),
  });
}

export function usePrograms(universityId?: number) {
  return useQuery<Program[]>({
    queryKey: ['programs', universityId],
    queryFn: () => api.get(`/api/universities/${universityId}/programs`).then(res => res.data),
    enabled: !!universityId,
  });
} 