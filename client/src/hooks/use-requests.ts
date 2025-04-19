import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import supabase from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { RequestWithUser } from '@/types';

export const useRequests = (userId?: string) => {
  const { toast } = useToast();

  // Get requests for a user
  const {
    data: requests,
    isLoading,
    error
  } = useQuery<RequestWithUser[]>({
    queryKey: ['/api/requests', userId],
    queryFn: async () => {
      let query = supabase
        .from('requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
        
      // Filter by user if specified
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data for frontend use (camelCase)
      return data.map(req => ({
        id: req.id,
        userId: req.user_id,
        subject: req.subject,
        message: req.message,
        status: req.status,
        response: req.response,
        createdAt: req.created_at,
        userName: req.profiles?.full_name,
        userEmail: req.profiles?.email
      }));
    },
    enabled: true, // For admins, we might want to load all requests even without a userId
  });

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: { userId: string, subject: string, message: string }) => {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          user_id: requestData.userId,
          subject: requestData.subject,
          message: requestData.message,
          status: 'pendiente' // Default status
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests', userId] });
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    },
  });

  // Respond to request mutation (admin/superuser only)
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, response, status }: { requestId: string, response: string, status: string }) => {
      const { data, error } = await supabase
        .from('requests')
        .update({
          response,
          status
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both specific user requests and all requests queries
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      toast({
        title: "Respuesta enviada",
        description: "La respuesta ha sido enviada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la respuesta",
        variant: "destructive",
      });
    },
  });

  // Get all requests (for admin)
  const {
    data: allRequests,
    isLoading: isLoadingAll,
    error: errorAll
  } = useQuery<RequestWithUser[]>({
    queryKey: ['/api/requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data for frontend use (camelCase)
      return data.map(req => ({
        id: req.id,
        userId: req.user_id,
        subject: req.subject,
        message: req.message,
        status: req.status,
        response: req.response,
        createdAt: req.created_at,
        userName: req.profiles?.full_name,
        userEmail: req.profiles?.email
      }));
    }
  });

  return {
    requests,
    allRequests,
    isLoading: isLoading || isLoadingAll,
    error: error || errorAll,
    createRequestMutation,
    respondToRequestMutation
  };
};

export default useRequests;
