import { useMutation, useQuery } from '@tanstack/react-query';
import { Document } from '@/types';
import { apiRequest, queryClient } from '@/lib/query-client';
import { toast } from 'sonner';

export function useDocuments(userId?: number) {
  const documentsQuery = useQuery<Document[]>({
    queryKey: ['/api/documents', userId],
    queryFn: () => apiRequest(`/api/documents${userId ? `?userId=${userId}` : ''}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { userId: number; type: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      formData.append('userId', data.userId.toString());
      
      return apiRequest<Document>('/api/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary
          'Content-Type': undefined as any,
        },
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
      // Actualizar inmediatamente el cache
      queryClient.setQueryData(['/api/documents', userId], (old: Document[] = []) => {
        return old.filter(doc => doc.id !== documentId);
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
    getDocumentUrl,
    refetch: documentsQuery.refetch,
  };
}
