import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useDocuments } from '@/hooks/use-documents';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Upload, Eye, Download, Trash2, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StudentLayout } from '@/components/layouts/StudentLayout';

const documentFormSchema = z.object({
  type: z.string().min(1, "Tipo de documento es requerido"),
  file: z.instanceof(File, { message: "Archivo es requerido" })
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const DocumentsPage = () => {
  const { user } = useAuth();
  const { documents, isLoading, uploadDocumentMutation, deleteDocumentMutation, getDocumentUrl } = useDocuments(user?.id);
  const { toast } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      type: '',
    }
  });

  const handleDocumentUpload = async (values: DocumentFormValues) => {
    if (!user?.id) return;
    
    uploadDocumentMutation.mutate({
      userId: user.id,
      type: values.type,
      file: values.file
    }, {
      onSuccess: () => {
        form.reset();
        setShowUploadForm(false);
      }
    });
  };

  const handleDeleteDocument = (documentId: string) => {
    deleteDocumentMutation.mutate(documentId);
  };

  const handleViewDocument = async (documentPath: string) => {
    try {
      const url = await getDocumentUrl(documentPath);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo abrir el documento",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (documentPath: string, documentType: string) => {
    try {
      const url = await getDocumentUrl(documentPath);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el documento",
        variant: "destructive",
      });
    }
  };

  // Función para obtener el badge de estado del documento
  const getStatusBadge = (status: string, rejectionReason?: string | null) => {
    switch(status) {
      case 'aprobado':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'rechazado':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300 cursor-help">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Rechazado
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium mb-1">Motivo del rechazo:</p>
                  <p className="text-sm">{rejectionReason || 'No se especificó motivo'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'pendiente':
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <StudentLayout>
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mis Documentos</h2>
            <p className="text-sm text-gray-500">Sube y gestiona tus documentos académicos y personales</p>
          </div>
          <Button 
            className="mt-3 sm:mt-0"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir documento
          </Button>
        </div>
        
        {/* Document upload form */}
        {showUploadForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-md">Subir nuevo documento</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleDocumentUpload)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="document-type">Tipo de documento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger id="document-type">
                                <SelectValue placeholder="Seleccione un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cedula">Cédula</SelectItem>
                              <SelectItem value="diploma">Diploma</SelectItem>
                              <SelectItem value="acta">Acta</SelectItem>
                              <SelectItem value="foto">Foto</SelectItem>
                              <SelectItem value="recibo">Recibo</SelectItem>
                              <SelectItem value="formulario">Formulario</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel htmlFor="document-file">Archivo</FormLabel>
                          <FormControl>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label htmlFor="document-file" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                    <span>Subir archivo</span>
                                    <input
                                      id="document-file"
                                      type="file"
                                      className="sr-only"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          onChange(file);
                                        }
                                      }}
                                      {...field}
                                    />
                                  </label>
                                  <p className="pl-1">o arrastra y suelta</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, PDF hasta 10MB
                                </p>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="mr-3"
                      onClick={() => {
                        form.reset();
                        setShowUploadForm(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploadDocumentMutation.isPending}
                    >
                      {uploadDocumentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>Subir documento</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {/* Document list */}
        <Card>
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <CardTitle className="text-md">Mis documentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="min-w-full divide-y divide-gray-200">
                <div className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <div key={document.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                              {document.type}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Subido el {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(document.status, document.rejectionReason)}
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDocument(document.filePath)}
                              className="text-primary-600 hover:text-primary-500"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(document.filePath, document.type)}
                              className="text-primary-600 hover:text-primary-500"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(document.id?.toString() || '')}
                              className="text-red-600 hover:text-red-500"
                              disabled={deleteDocumentMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza subiendo tu primer documento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default DocumentsPage;
