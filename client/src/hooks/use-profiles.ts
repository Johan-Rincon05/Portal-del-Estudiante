import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export interface ProfileWithCounts extends Profile {
  documentCount: number;
  pendingRequestCount: number;
}

export const useProfiles = (userId?: string) => {
  const { toast } = useToast();

  // Get single profile by user ID
  const {
    data: profile,
    isLoading,
    error
  } = useQuery<ProfileWithCounts | null>({
    queryKey: ['/api/profiles', userId],
    queryFn: async () => {
      if (!userId) return null;
      return apiRequest<ProfileWithCounts>(`/api/profiles/${userId}`);
    },
    enabled: !!userId,
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
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<Profile> & { id: string }) => {
      const { id, ...data } = profileData;
      return apiRequest<Profile>(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', userId] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    allProfiles,
    isLoading: isLoading || isLoadingAll,
    error: error || errorAll,
    updateProfileMutation
  };
};

export default useProfiles;
