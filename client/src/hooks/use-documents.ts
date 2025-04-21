import { useMutation, useQuery } from '@tanstack/react-query';
import { Document } from '@/types';
import { apiRequest } from '@/lib/query-client';
import { toast } from 'sonner';

export function useDocuments() {
  const documentsQuery = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: () => apiRequest('/documents'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return apiRequest<Document>('/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary
          'Content-Type': undefined as any,
        },
      });
    },
    onSuccess: () => {
      toast.success('Documento subido exitosamente');
      documentsQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir el documento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiRequest(`/documents/${documentId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast.success('Documento eliminado exitosamente');
      documentsQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el documento');
    },
  });

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    uploadDocument: uploadMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
