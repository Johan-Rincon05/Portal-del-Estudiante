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
import { Loader2, PlusCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { StudentLayout } from '@/components/layouts/StudentLayout';

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
  const { requests, isLoading, createRequestMutation } = useRequests(user?.id?.toString());
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
      <div className="container max-w-5xl mx-auto px-4 py-6">
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
                        {request.message.length > 100 && expandedRequestId !== request.id?.toString()
                          ? `${request.message.slice(0, 100)}...`
                          : request.message}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Creada el {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-primary-600 hover:text-primary-500"
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
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
                <p className="mt-1 text-sm text-gray-500">
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
