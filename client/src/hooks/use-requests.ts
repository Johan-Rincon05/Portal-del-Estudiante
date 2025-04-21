import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Request, UpdateRequest } from "@shared/schema";
import { useToast } from "./use-toast";

interface UseRequestsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRequests(options: UseRequestsOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener todas las solicitudes
  const requestsQuery = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const response = await fetch("/api/requests");
      if (!response.ok) {
        throw new Error("Error al obtener las solicitudes");
      }
      return response.json() as Promise<Request[]>;
    },
  });

  // Crear una nueva solicitud
  const createRequestMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la solicitud");
      }

      return response.json() as Promise<Request>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
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
      const response = await fetch(`/api/requests/${id}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al responder la solicitud");
      }

      return response.json() as Promise<Request>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
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
    queryKey: ["requests", "active-count"],
    queryFn: async () => {
      const response = await fetch("/api/requests/active-count");
      if (!response.ok) {
        throw new Error("Error al obtener el conteo de solicitudes activas");
      }
      const data = await response.json();
      return data.count as number;
    },
  });

  return {
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    error: requestsQuery.error,
    createRequestMutation,
    respondToRequestMutation,
    activeRequestsCount: activeRequestsCountQuery.data || 0,
  };
}
