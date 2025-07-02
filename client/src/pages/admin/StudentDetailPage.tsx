import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useProfiles } from '@/hooks/use-profiles';
import { useDocuments } from '@/hooks/use-documents';
import { useRequests } from '@/hooks/use-requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, ArrowLeft, FileText, Eye, Download, Trash2, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/layouts/AdminLayout';

const responseFormSchema = z.object({
  response: z.string().min(5, "Respuesta es requerida"),
  status: z.enum(["pendiente", "en_proceso", "completada", "rechazada"])
});

const enrollmentStageSchema = z.object({
  enrollmentStage: z.enum([
    "suscrito",
    "documentos_completos", 
    "registro_validado",
    "proceso_universitario",
    "matriculado",
    "inicio_clases",
    "estudiante_activo",
    "pagos_al_dia",
    "proceso_finalizado"
  ]),
  comments: z.string().optional(),
  validationNotes: z.string().optional()
});

type ResponseFormValues = z.infer<typeof responseFormSchema>;
type EnrollmentStageFormValues = z.infer<typeof enrollmentStageSchema>;

const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { profile, isLoading: isProfileLoading, updateProfileMutation, updateEnrollmentStageMutation, stageHistory } = useProfiles(id);
  const { documents, isLoading: isDocumentsLoading, deleteDocumentMutation, getDocumentUrl } = useDocuments(id ? parseInt(id) : undefined);
  const { 
    requests, 
    isLoading: isRequestsLoading, 
    respondToRequestMutation 
  } = useRequests(id);
  
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const responseForm = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      response: '',
      status: 'en_proceso'
    }
  });

  const enrollmentStageForm = useForm<EnrollmentStageFormValues>({
    resolver: zodResolver(enrollmentStageSchema),
    defaultValues: {
      enrollmentStage: profile?.enrollmentStage || 'suscrito',
      comments: '',
      validationNotes: ''
    }
  });

  const handleRespondToRequest = (requestId: number, values: ResponseFormValues) => {
    respondToRequestMutation.mutate({
      id: requestId,
      data: {
        response: values.response,
        status: values.status
      }
    }, {
      onSuccess: () => {
        responseForm.reset();
        setActiveRequestId(null);
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

  const handleUpdateEnrollmentStage = (values: EnrollmentStageFormValues) => {
    updateEnrollmentStageMutation.mutate(values);
  };

  useEffect(() => {
    if (profile) {
      enrollmentStageForm.reset({
        enrollmentStage: profile.enrollmentStage || 'suscrito',
        comments: '',
        validationNotes: ''
      });
    }
  }, [profile, enrollmentStageForm]);

  if (isProfileLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/admin/students" className="text-primary-600 hover:text-primary-900 mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-lg font-semibold text-gray-900">Detalle de Estudiante</h2>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Mail className="mr-1 h-4 w-4" />
              Enviar correo
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">ID: {profile.id}</p>
      </div>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="documents">
            Documentos
            {!isDocumentsLoading && documents && (
              <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {documents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Solicitudes
            {!isRequestsLoading && requests && (
              <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            Historial
            {stageHistory && (
              <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {stageHistory.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader className="px-6 py-5 flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Información del perfil</CardTitle>
                <p className="text-sm text-gray-500">Datos personales y de contacto</p>
              </div>
              <Button size="sm" variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                Editar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.fullName}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Correo electrónico</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Documento</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile.documentType === 'cedula' ? 'Cédula' : 
                     profile.documentType === 'pasaporte' ? 'Pasaporte' : 
                     'Tarjeta de identidad'}: {profile.documentNumber}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha de nacimiento</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'No especificada'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.phone}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Ciudad</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.city}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.address}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha de registro</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'No especificada'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Componente de Etapa de Matrícula */}
          <Card className="mt-6">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Etapa de Matrícula
              </CardTitle>
              <p className="text-sm text-gray-500">Gestiona el progreso del estudiante en el proceso de matrícula</p>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <Form {...enrollmentStageForm}>
                <form onSubmit={enrollmentStageForm.handleSubmit(handleUpdateEnrollmentStage)} className="space-y-4">
                  <FormField
                    control={enrollmentStageForm.control}
                    name="enrollmentStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Etapa Actual del Estudiante
                        </FormLabel>
                        <div className="flex items-center gap-4">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Selecciona la etapa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="suscrito">Suscrito</SelectItem>
                              <SelectItem value="documentos_completos">Documentos Completos</SelectItem>
                              <SelectItem value="registro_validado">Registro Validado</SelectItem>
                              <SelectItem value="proceso_universitario">Proceso Universitario</SelectItem>
                              <SelectItem value="matriculado">Matriculado</SelectItem>
                              <SelectItem value="inicio_clases">Inicio de Clases</SelectItem>
                              <SelectItem value="estudiante_activo">Estudiante Activo</SelectItem>
                              <SelectItem value="pagos_al_dia">Pagos al Día</SelectItem>
                              <SelectItem value="proceso_finalizado">Proceso Finalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={enrollmentStageForm.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Comentarios (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Agrega comentarios sobre el cambio de etapa..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={enrollmentStageForm.control}
                    name="validationNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Notas de Validación (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notas internas sobre la validación del cambio..."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={updateEnrollmentStageMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {updateEnrollmentStageMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>Actualizar Etapa</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg">Documentos del estudiante</CardTitle>
              <p className="text-sm text-gray-500">Archivos subidos por el estudiante</p>
            </CardHeader>
            <CardContent className="p-0 border-t border-gray-200">
              {isDocumentsLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((document) => (
                        <tr key={document.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded flex items-center justify-center">
                                <FileText className="h-4 w-4 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'No especificada'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary-600 hover:text-primary-900 mr-2"
                              onClick={() => handleViewDocument(document.id.toString())}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="ml-1">Ver</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary-600 hover:text-primary-900 mr-2"
                              onClick={() => handleDownloadDocument(document.id.toString(), document.type)}
                            >
                              <Download className="h-4 w-4" />
                              <span className="ml-1">Descargar</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteDocument(document.id.toString())}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-1">Eliminar</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
                  <p className="mt-1 text-sm text-gray-500">El estudiante aún no ha subido documentos.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg">Solicitudes del estudiante</CardTitle>
              <p className="text-sm text-gray-500">Historial de solicitudes realizadas</p>
            </CardHeader>
            <CardContent className="border-t border-gray-200">
              {isRequestsLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : requests && requests.length > 0 ? (
                <div className="px-4 py-5 space-y-6">
                  {requests.map((request) => (
                    <div key={request.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{request.subject}</h4>
                        <Badge variant="outline" className={
                          request.status === 'pendiente' ? 'bg-red-100 text-red-800' :
                          request.status === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'completada' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {request.status === 'pendiente' ? 'Pendiente' :
                           request.status === 'en_proceso' ? 'En proceso' :
                           request.status === 'completada' ? 'Completada' :
                           'Rechazada'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{request.message}</p>
                      <div className="text-xs text-gray-500 mb-4">Creada el {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Fecha no especificada'}</div>
                      
                      {request.response ? (
                        <div className="bg-white p-3 border border-gray-200 rounded-md">
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Respuesta:</h5>
                          <p className="text-sm text-gray-900">{request.response}</p>
                        </div>
                      ) : (
                        <Form {...responseForm}>
                          <form 
                            onSubmit={responseForm.handleSubmit((values) => handleRespondToRequest(request.id, values))}
                            className="mt-4 bg-white p-3 border border-gray-200 rounded-md"
                          >
                            <h5 className="text-xs font-medium text-gray-700 mb-2">Responder solicitud</h5>
                            
                            <FormField
                              control={responseForm.control}
                              name="response"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      rows={3}
                                      placeholder="Escribe tu respuesta aquí..."
                                      className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="mt-3 flex items-center justify-between">
                              <FormField
                                control={responseForm.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center">
                                      <FormLabel className="text-xs mr-2">Estado:</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-8 py-1 px-2 text-sm border border-gray-300 rounded-md w-40">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="en_proceso">En proceso</SelectItem>
                                          <SelectItem value="completada">Completada</SelectItem>
                                          <SelectItem value="rechazada">Rechazada</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button 
                                type="submit"
                                size="sm"
                                disabled={respondToRequestMutation.isPending}
                              >
                                {respondToRequestMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>Enviar respuesta</>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
                  <p className="mt-1 text-sm text-gray-500">El estudiante aún no ha realizado solicitudes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg">Historial de Etapas</CardTitle>
              <p className="text-sm text-gray-500">Historial de cambios de etapa del estudiante</p>
            </CardHeader>
            <CardContent className="border-t border-gray-200">
              {stageHistory && stageHistory.length > 0 ? (
                <div className="px-4 py-5 space-y-6">
                  {stageHistory.map((stage) => (
                    <div key={stage.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {stage.previousStage} → {stage.newStage}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Cambiado por: {stage.changedBy} ({stage.changedByRole})
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {stage.validationStatus === 'approved' ? 'Aprobado' : 
                           stage.validationStatus === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                      </div>
                      {stage.comments && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            <strong>Comentarios:</strong> {stage.comments}
                          </p>
                        </div>
                      )}
                      {stage.validationNotes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            <strong>Notas de validación:</strong> {stage.validationNotes}
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Fecha: {stage.createdAt ? new Date(stage.createdAt).toLocaleDateString() : 'Fecha no especificada'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historial</h3>
                  <p className="mt-1 text-sm text-gray-500">El estudiante aún no ha cambiado de etapa.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default StudentDetailPage;
