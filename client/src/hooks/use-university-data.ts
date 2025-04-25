import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { z } from 'zod';
import { universityDataFormSchema } from '@shared/schema';

export type UniversityData = z.infer<typeof universityDataFormSchema>;

export function useUniversityData(userId?: string) {
  return useQuery({
    queryKey: ['university-data', userId],
    queryFn: () => api.get(`/api/university-data/${userId}`).then(res => res.data),
    enabled: !!userId,
  });
}

export function useUpdateUniversityData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UniversityData & { userId: string }) =>
      api.post('/api/university-data', data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['university-data', variables.userId] });
    },
  });
} 