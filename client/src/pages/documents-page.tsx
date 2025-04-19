import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Document, documentTypes } from "@shared/schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, FileText, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, uploadFile, getFileUrl } from "@/lib/supabase";

// File upload form schema
const fileUploadSchema = z.object({
  type: z.string().min(1, "Debe seleccionar un tipo de documento"),
  file: z.instanceof(File, { message: "Debe seleccionar un archivo" }),
});

type FileUploadFormData = z.infer<typeof fileUploadSchema>;

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null);

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  // Setup form for file upload
  const form = useForm<FileUploadFormData>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      type: "",
    },
  });

  // File upload state
  const [fileState, setFileState] = useState<{
    file: File | null;
    uploading: boolean;
  }>({
    file: null,
    uploading: false,
  });

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileState({ ...fileState, file });
      form.setValue("file", file);
    }
  };

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: FileUploadFormData) => {
      setFileState({ ...fileState, uploading: true });
      
      try {
        // 1. Upload the file to Supabase Storage
        const filePath = await uploadFile(
          data.file,
          "documents",
          `${user!.id}/${data.type}`
        );
        
        // 2. Create the document record in the database
        const res = await apiRequest("POST", "/api/documents", {
          user_id: user!.id,
          type: data.type,
          path: filePath,
        });
        
        return await res.json();
      } finally {
        setFileState({ ...fileState, uploading: false });
      }
    },
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "Tu documento ha sido subido correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setUploadDialogOpen(false);
      form.reset();
      setFileState({ file: null, uploading: false });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al subir el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Document delete mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/documents/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setDeleteDocument(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FileUploadFormData) => {
    uploadDocumentMutation.mutate(data);
  };

  // Download document handler
  const handleDownload = (document: Document) => {
    const url = getFileUrl("documents", document.path);
    window.open(url, "_blank");
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mis Documentos</CardTitle>
            <CardDescription>
              Sube y gestiona tus documentos personales.
            </CardDescription>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Subir documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir nuevo documento</DialogTitle>
                <DialogDescription>
                  Selecciona el tipo de documento y sube el archivo correspondiente.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de documento</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                      <FormItem>
                        <FormLabel>Archivo</FormLabel>
                        <FormControl>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                  <span>Subir un archivo</span>
                                  <input 
                                    id="file-upload" 
                                    name="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1">o arrastrar y soltar</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, JPG, PNG hasta 10MB
                              </p>
                              {fileState.file && (
                                <p className="text-sm text-gray-900">
                                  {fileState.file.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUploadDialogOpen(false);
                        form.reset();
                        setFileState({ file: null, uploading: false });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={fileState.uploading || uploadDocumentMutation.isPending}
                    >
                      {(fileState.uploading || uploadDocumentMutation.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        "Subir"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tienes documentos</h3>
              <p className="mt-2 text-sm text-gray-500">
                Comienza subiendo tus documentos personales.
              </p>
              <Button
                className="mt-4"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Subir documento
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((document: Document) => (
                <Card key={document.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <FileText className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {documentTypes.find(t => t.value === document.type)?.label || document.type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Subido el {formatDate(document.uploaded_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:text-primary-700"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente este documento.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deleteDocumentMutation.mutate(document.id)}
                              disabled={deleteDocumentMutation.isPending}
                            >
                              {deleteDocumentMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Eliminando...
                                </>
                              ) : (
                                "Eliminar"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
