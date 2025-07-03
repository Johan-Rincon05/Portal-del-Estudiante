import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRequests } from '@/hooks/use-requests';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { StudentLayout } from '@/components/layouts/StudentLayout';

const requestFormSchema = z.object({
  requestType: z.enum(["financiera", "academica", "documental_administrativa", "datos_estudiante_administrativa"], {
    required_error: "El tipo de solicitud es requerido"
  }),
  subject: z.string().min(3, "Asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres")
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'pendiente':
      return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">Pendiente</Badge>;
    case 'en_proceso':
      return <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">En proceso</Badge>;
    case 'completada':
      return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">Completada</Badge>;
    case 'rechazada':
      return <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300">Rechazada</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getRequestTypeBadge = (requestType: string) => {
  switch(requestType) {
    case 'financiera':
      return <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">Financiera</Badge>;
    case 'academica':
      return <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400">Académica</Badge>;
    case 'documental_administrativa':
      return <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">Documental</Badge>;
    case 'datos_estudiante_administrativa':
      return <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">Datos Estudiante</Badge>;
    default:
      return <Badge variant="secondary">{requestType}</Badge>;
  }
};

const RequestsPage = () => {
  const { user } = useAuth();
  const { requests, isLoading, createRequestMutation } = useRequests(user?.id?.toString());
  const [showForm, setShowForm] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      requestType: 'academica',
      subject: '',
      message: ''
    }
  });

  const handleCreateRequest = (values: RequestFormValues) => {
    if (!user?.id) return;
    
    createRequestMutation.mutate({
      requestType: values.requestType,
      subject: values.subject,
      message: values.message
    });
  };

  const toggleRequestDetails = (requestId: string) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null);
    } else {
      setExpandedRequestId(requestId);
    }
  };

  return (
    <StudentLayout>
      <div className="container w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Mis Solicitudes</h2>
          <p className="text-sm text-muted-foreground">Crea y da seguimiento a tus solicitudes administrativas</p>
        </div>
        <Button 
          className="mt-3 sm:mt-0"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva solicitud
        </Button>
      </div>
      
      {/* Request form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-md">Crear nueva solicitud</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateRequest)}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="request-type">Tipo de solicitud</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="financiera">Financiera</SelectItem>
                              <SelectItem value="academica">Académica</SelectItem>
                              <SelectItem value="documental_administrativa">Documental - Administrativa</SelectItem>
                              <SelectItem value="datos_estudiante_administrativa">Datos del Estudiante - Administrativa</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="request-subject">Asunto</FormLabel>
                        <FormControl>
                          <Input
                            id="request-subject"
                            placeholder="Ej. Solicitud de certificado"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="request-message">Mensaje</FormLabel>
                        <FormControl>
                          <Textarea
                            id="request-message"
                            rows={4}
                            placeholder="Describe detalladamente tu solicitud..."
                            {...field}
                          />
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
                      setShowForm(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createRequestMutation.isPending}
                  >
                    {createRequestMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>Enviar solicitud</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Request list */}
      <Card>
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-md">Historial de solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="min-w-full divide-y divide-border">
              <div className="divide-y divide-border">
                {requests.map((request) => (
                  <div key={request.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">{request.subject}</h4>
                        {getRequestTypeBadge(request.requestType || 'academica')}
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {request.message.length > 100 && expandedRequestId !== request.id?.toString()
                        ? `${request.message.slice(0, 100)}...`
                        : request.message}
                    </p>
                    
                    {/* Mostrar respuesta del administrador cuando está expandida */}
                    {expandedRequestId === request.id?.toString() && request.response && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Respuesta del Administrador</span>
                        </div>
                        <p className="text-sm text-blue-800 mb-2">{request.response}</p>
                        {request.respondedAt && (
                          <span className="text-xs text-blue-600">
                            Respondida el {new Date(request.respondedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Creada el {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-primary hover:text-primary/80"
                        onClick={() => toggleRequestDetails(request.id?.toString() || '')}
                      >
                        {expandedRequestId === request.id?.toString() ? (
                          <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Ver menos
                          </>
                        ) : (
                          <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Ver más
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
              <div className="text-center py-10">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No hay solicitudes</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comienza creando tu primera solicitud.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </StudentLayout>
  );
};

export default RequestsPage;
