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
    mutationFn: async ({ id, data }: { id: number; data: UpdateRequest }) => {
      return apiRequest<Request>(`/api/requests/${id}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (updatedRequest) => {
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(["/api/requests", userId], (old: Request[] = []) => {
        return old.map(req => req.id === updatedRequest.id ? updatedRequest : req);
      });
      
      // Invalidar queries relacionadas
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
