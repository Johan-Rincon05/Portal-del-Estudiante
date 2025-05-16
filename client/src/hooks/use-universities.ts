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
    queryFn: async () => {
      try {
        const response = await api.get('/api/universities');
        console.log('Universidades obtenidas:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error al obtener universidades:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function usePrograms(universityId?: number) {
  return useQuery<Program[]>({
    queryKey: ['programs', universityId],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/universities/${universityId}/programs`);
        console.log('Programas obtenidos:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error al obtener programas:', error);
        throw error;
      }
    },
    enabled: !!universityId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
} 