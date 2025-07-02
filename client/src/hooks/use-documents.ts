import { useMutation, useQuery } from '@tanstack/react-query';
import { Document, UpdateDocumentStatus } from '@/types';
import { apiRequest, queryClient } from '@/lib/query-client';
import { toast } from 'sonner';

export function useDocuments(userId?: string) {
  const documentsQuery = useQuery<Document[]>({
    queryKey: ['/api/documents', userId],
    queryFn: () => apiRequest(`/api/documents${userId ? `?userId=${userId}` : ''}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { userId: string; type: string; file: File; observations?: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      formData.append('userId', data.userId);
      if (data.observations) {
        formData.append('observations', data.observations);
      }
      
      // Log de depuración
      console.log('[DEBUG] Frontend - Documento a enviar:', {
        fileName: data.file.name,
        fileSize: data.file.size,
        fileType: data.file.type,
        type: data.type,
        observations: data.observations
      });
      
      // Verificar que el FormData tenga el archivo
      for (let [key, value] of formData.entries()) {
        console.log('[DEBUG] FormData entry:', key, value);
      }
      
      return apiRequest<Document>('/api/documents', {
        method: 'POST',
        body: formData,
        // No establecer Content-Type para que el navegador lo configure automáticamente con el boundary
      });
    },
    onSuccess: (newDocument) => {
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(['/api/documents', userId], (old: Document[] = []) => {
        return [...old, newDocument];
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      
      toast.success('Documento subido exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir el documento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiRequest(`/api/documents/${documentId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, documentId) => {
      console.log('[DEBUG] Eliminando documento del cache:', documentId);
      
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(['/api/documents', userId], (old: Document[] = []) => {
        console.log('[DEBUG] Documentos antes de eliminar:', old.length);
        const filtered = old.filter(doc => doc.id?.toString() !== documentId);
        console.log('[DEBUG] Documentos después de eliminar:', filtered.length);
        return filtered;
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      
      toast.success('Documento eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el documento');
    },
  });

  // Actualizar estado de documento (solo para administradores)
  const updateDocumentStatusMutation = useMutation({
    mutationFn: async ({ documentId, data }: { documentId: string; data: UpdateDocumentStatus }) => {
      return apiRequest<{ message: string; document: Document }>(`/api/documents/${documentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response, { documentId }) => {
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(['/api/documents', userId], (old: Document[] = []) => {
        return old.map(doc => doc.id === documentId ? response.document : doc);
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el estado del documento');
    },
  });

  const getDocumentUrl = async (documentPath: string): Promise<string> => {
    try {
      const response = await apiRequest<{ url: string }>(`/api/documents/${documentPath}/url`);
      return response.url;
    } catch (error) {
      throw new Error('No se pudo obtener la URL del documento');
    }
  };

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    uploadDocumentMutation: uploadMutation,
    deleteDocumentMutation: deleteMutation,
    updateDocumentStatusMutation: updateDocumentStatusMutation,
    getDocumentUrl,
    refetch: documentsQuery.refetch,
  };
}
