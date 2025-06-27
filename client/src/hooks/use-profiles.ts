import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Profile, UpdateEnrollmentStage } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export interface ProfileWithCounts extends Profile {
  documentCount: number;
  pendingRequestCount: number;
}

interface UseProfilesOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useProfiles(userId?: string, options: UseProfilesOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    enabled: !!userId,
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
    staleTime: 1000 * 60 * 5, // 5 minutos
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

  // Actualizar etapa de matrícula
  const updateEnrollmentStageMutation = useMutation({
    mutationFn: async (data: UpdateEnrollmentStage) => {
      return apiRequest<{ message: string; profile: Profile }>(`/api/profiles/${userId}/stage`, {
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
    isLoading: isLoading || isLoadingAll,
    error: error || errorAll,
    updateProfileMutation,
    updateEnrollmentStageMutation,
    refetch
  };
}

export default useProfiles;

