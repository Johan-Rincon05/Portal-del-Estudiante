import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import supabase from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DocumentWithUser } from '@/types';

export const useDocuments = (userId?: string) => {
  const { toast } = useToast();

  // Get documents
  const {
    data: documents,
    isLoading,
    error
  } = useQuery<DocumentWithUser[]>({
    queryKey: ['/api/documents', userId],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('uploaded_at', { ascending: false });
        
      // Filter by user if specified
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data for frontend use (camelCase)
      return data.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        type: doc.type,
        path: doc.path,
        uploadedAt: doc.uploaded_at,
        userName: doc.profiles?.full_name,
        userEmail: doc.profiles?.email
      }));
    },
    enabled: true, // For admins, we might want to load all docs even without a userId
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ userId, type, file }: { userId: string, type: string, file: File }) => {
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // 2. Create document record in DB
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          type,
          path: filePath
        })
        .select()
        .single();
        
      if (dbError) throw dbError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', userId] });
      toast({
        title: "Documento subido",
        description: "El documento ha sido subido correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el documento",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      // 1. Get the document to find its path
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('path')
        .eq('id', documentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // 2. Delete from Storage
      const { error: storageError } = await supabase
        .storage
        .from('documents')
        .remove([doc.path]);
        
      if (storageError) throw storageError;
      
      // 3. Delete record from DB
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
        
      if (dbError) throw dbError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', userId] });
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el documento",
        variant: "destructive",
      });
    },
  });

  // Get document URL for viewing/downloading
  const getDocumentUrl = async (path: string): Promise<string> => {
    const { data, error } = await supabase
      .storage
      .from('documents')
      .createSignedUrl(path, 60); // 60 seconds expiry
      
    if (error) throw error;
    return data.signedUrl;
  };

  return {
    documents,
    isLoading,
    error,
    uploadDocumentMutation,
    deleteDocumentMutation,
    getDocumentUrl
  };
};

export default useDocuments;
