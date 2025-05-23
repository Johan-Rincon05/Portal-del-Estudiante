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
import { Loader2, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

const requestFormSchema = z.object({
  subject: z.string().min(3, "Asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres")
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'pendiente':
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Pendiente</Badge>;
    case 'en_proceso':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En proceso</Badge>;
    case 'completada':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completada</Badge>;
    case 'rechazada':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Rechazada</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const RequestsPage = () => {
  const { user } = useAuth();
  const { requests, isLoading, createRequestMutation } = useRequests(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      subject: '',
      message: ''
    }
  });

  const handleCreateRequest = (values: RequestFormValues) => {
    if (!user?.id) return;
    
    createRequestMutation.mutate({
      userId: user.id,
      subject: values.subject,
      message: values.message
    }, {
      onSuccess: () => {
        form.reset();
        setShowForm(false);
      }
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
    <>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mis Solicitudes</h2>
          <p className="text-sm text-gray-500">Crea y da seguimiento a tus solicitudes administrativas</p>
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
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-md">Historial de solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <div key={request.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{request.subject}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {request.message.length > 100 && expandedRequestId !== request.id
                        ? `${request.message.slice(0, 100)}...`
                        : request.message}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Creada el {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-primary-600 hover:text-primary-500"
                        onClick={() => toggleRequestDetails(request.id)}
                      >
                        {expandedRequestId === request.id ? (
                          <>
                            Ocultar detalles
                            <ChevronUp className="ml-1 h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Ver detalles
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {expandedRequestId === request.id && request.response && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-xs font-medium text-gray-500">Respuesta:</p>
                        <p className="text-sm text-gray-700">{request.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes solicitudes</h3>
              <p className="mt-1 text-sm text-gray-500">Crea tu primera solicitud para comenzar.</p>
              <div className="mt-6">
                <Button onClick={() => setShowForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva solicitud
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RequestsPage;
