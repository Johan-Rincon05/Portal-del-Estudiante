import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Request, UpdateRequest } from "@shared/schema";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/query-client";

interface UseRequestsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRequests(userId?: string, options: UseRequestsOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener todas las solicitudes
  const requestsQuery = useQuery({
    queryKey: ["/api/requests", userId],
    queryFn: async () => {
      return apiRequest<Request[]>(`/api/requests${userId ? `?userId=${userId}` : ''}`);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Crear una nueva solicitud
  const createRequestMutation = useMutation({
    mutationFn: async (data: { requestType: string; subject: string; message: string }) => {
      return apiRequest<Request>("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (newRequest) => {
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(["/api/requests", userId], (old: Request[] = []) => {
        return [...old, newRequest];
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      
      toast({
        title: "Solicitud creada",
        description: "Tu solicitud ha sido enviada exitosamente.",
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

  // Responder a una solicitud (solo admin)
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, response, status }: { requestId: string; response: string; status: string }) => {
      return apiRequest<Request>(`/api/requests/${requestId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, status }),
      });
    },
    onSuccess: (updatedRequest) => {
      // Actualizar inmediatamente el cache del usuario actual
      queryClient.setQueryData(["/api/requests", userId], (old: Request[] = []) => {
        return old.map(req => req.id === updatedRequest.id ? updatedRequest : req);
      });
      
      // Actualizar también el cache de todas las solicitudes (para admin)
      queryClient.setQueryData(["/api/requests", "all"], (old: Request[] = []) => {
        return old.map(req => req.id === updatedRequest.id ? updatedRequest : req);
      });
      
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      
      toast({
        title: "Respuesta enviada",
        description: "La solicitud ha sido actualizada exitosamente.",
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

  // Obtener el conteo de solicitudes activas
  const activeRequestsCountQuery = useQuery({
    queryKey: ["/api/requests", "active-count", userId],
    queryFn: async () => {
      const response = await apiRequest<{ count: number }>(`/api/requests/active-count${userId ? `?userId=${userId}` : ''}`);
      return response.count;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minuto
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    error: requestsQuery.error,
    createRequestMutation,
    respondToRequestMutation,
    activeRequestsCount: activeRequestsCountQuery.data || 0,
    refetch: requestsQuery.refetch,
  };
}

// Hook específico para obtener todas las solicitudes (para admin)
export function useAllRequests(options: UseRequestsOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener todas las solicitudes (sin userId para obtener todas)
  const allRequestsQuery = useQuery({
    queryKey: ["/api/requests", "all"],
    queryFn: async () => {
      return apiRequest<Request[]>("/api/requests");
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Responder a una solicitud (solo admin)
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, response, status }: { requestId: string; response: string; status: string }) => {
      return apiRequest<Request>(`/api/requests/${requestId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, status }),
      });
    },
    onSuccess: (updatedRequest) => {
      // Actualizar inmediatamente el cache de todas las solicitudes
      queryClient.setQueryData(["/api/requests", "all"], (old: Request[] = []) => {
        return old.map(req => req.id === updatedRequest.id ? updatedRequest : req);
      });
      
      // Actualizar también el cache específico del estudiante que envió la solicitud
      queryClient.setQueryData(["/api/requests", updatedRequest.userId?.toString()], (old: Request[] = []) => {
        return old.map(req => req.id === updatedRequest.id ? updatedRequest : req);
      });
      
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      
      toast({
        title: "Respuesta enviada",
        description: "La solicitud ha sido actualizada exitosamente.",
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
    allRequests: allRequestsQuery.data || [],
    isLoading: allRequestsQuery.isLoading,
    error: allRequestsQuery.error,
    respondToRequestMutation,
    refetch: allRequestsQuery.refetch,
  };
}
