import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import supabase from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@shared/schema';
import { ProfileWithCounts } from '@/types';

export const useProfiles = (userId?: string) => {
  const { toast } = useToast();

  // Get single profile by user ID
  const {
    data: profile,
    isLoading,
    error
  } = useQuery<ProfileWithCounts>({
    queryKey: ['/api/profiles', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Get document count
      const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      // Get pending request count
      const { count: pendingRequestCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['pendiente', 'en_proceso']);
      
      // Transform to camelCase
      return {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        documentType: profile.document_type,
        documentNumber: profile.document_number,
        birthDate: profile.birth_date,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        createdAt: profile.created_at,
        documentCount: documentCount || 0,
        pendingRequestCount: pendingRequestCount || 0
      };
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
      // Only admin/superuser can access this
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get documents counts for all users
      const { data: documentCounts } = await supabase
        .from('documents')
        .select('user_id, count')
        .group('user_id');
        
      // Get pending request counts for all users
      const { data: requestCounts } = await supabase
        .from('requests')
        .select('user_id, count')
        .in('status', ['pendiente', 'en_proceso'])
        .group('user_id');
      
      // Transform data and merge counts
      return profiles.map(profile => {
        const docCount = documentCounts?.find(d => d.user_id === profile.id)?.count || 0;
        const reqCount = requestCounts?.find(r => r.user_id === profile.id)?.count || 0;
        
        return {
          id: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          documentType: profile.document_type,
          documentNumber: profile.document_number,
          birthDate: profile.birth_date,
          phone: profile.phone,
          city: profile.city,
          address: profile.address,
          createdAt: profile.created_at,
          documentCount: docCount,
          pendingRequestCount: reqCount
        };
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<Profile> & { id: string }) => {
      const { id, ...rest } = profileData;
      
      // Convert from camelCase to snake_case for Supabase
      const dbData = {
        full_name: rest.fullName,
        document_type: rest.documentType,
        document_number: rest.documentNumber,
        birth_date: rest.birthDate,
        phone: rest.phone,
        city: rest.city,
        address: rest.address
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
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
