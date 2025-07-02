import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import { Profile, UpdateEnrollmentStage, EnrollmentStageHistory } from '@shared/schema';
import { useAuth } from './use-auth';

export interface ProfileWithCounts extends Profile {
  documentCount: number;
  pendingRequestCount: number;
}

export interface StageHistoryItem extends EnrollmentStageHistory {
  changedBy: string;
  changedByRole: string;
}

interface UseProfilesOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useProfiles(userId?: string, options: UseProfilesOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get single profile by user ID
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery<ProfileWithCounts | null>({
    queryKey: ['/api/profiles', userId],
    queryFn: async () => {
      if (!userId) return null;
      return apiRequest<ProfileWithCounts>(`/api/profiles/${userId}`);
    },
    enabled: !!userId && !!user, // Solo ejecutar si hay userId y usuario autenticado
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Get all profiles (for admin use)
  const {
    data: allProfiles,
    isLoading: isLoadingAll,
    error: errorAll
  } = useQuery<ProfileWithCounts[]>({
    queryKey: ['/api/profiles'],
    queryFn: async () => {
      return apiRequest<ProfileWithCounts[]>('/api/profiles');
    },
    enabled: !!user, // Solo ejecutar si hay usuario autenticado
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Get stage history for a user
  const {
    data: stageHistory,
    isLoading: isLoadingHistory,
    error: errorHistory,
    refetch: refetchHistory
  } = useQuery<StageHistoryItem[]>({
    queryKey: ['/api/profiles', userId, 'stage-history'],
    queryFn: async () => {
      if (!userId) return [];
      return apiRequest<StageHistoryItem[]>(`/api/profiles/${userId}/stage-history`);
    },
    enabled: !!userId && !!user, // Solo ejecutar si hay userId y usuario autenticado
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      return apiRequest<Profile>(`/api/profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    },
    onSuccess: (updatedProfile) => {
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(['/api/profiles', userId], updatedProfile);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', userId] });
      
      toast({
        title: "Perfil actualizado",
        description: "El perfil ha sido actualizado exitosamente.",
      });
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      options.onError?.(error);
    },
  });

  // Actualizar etapa de matrícula con comentarios y validaciones
  const updateEnrollmentStageMutation = useMutation({
    mutationFn: async (data: UpdateEnrollmentStage) => {
      return apiRequest<{ message: string; profile: Profile; validationData: any }>(`/api/profiles/${userId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    },
    onSuccess: (response) => {
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(['/api/profiles', userId], response.profile);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', userId, 'stage-history'] });
      
      toast({
        title: "Etapa actualizada",
        description: response.message,
      });
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      options.onError?.(error);
    },
  });

  return {
    profile,
    allProfiles,
    stageHistory,
    isLoading: isLoading || isLoadingAll || isLoadingHistory,
    error: error || errorAll || errorHistory,
    updateProfileMutation,
    updateEnrollmentStageMutation,
    refetch,
    refetchHistory
  };
}

export default useProfiles;

