import { useState } from 'react';
import { useAllRequests } from '@/hooks/use-requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, User, MessageSquare } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminLayout } from '@/components/layouts/AdminLayout';

const responseFormSchema = z.object({
  response: z.string().min(5, "Respuesta es requerida"),
  status: z.enum(["pendiente", "en_proceso", "completada", "rechazada"])
});

type ResponseFormValues = z.infer<typeof responseFormSchema>;

const RequestsPage = () => {
  const { allRequests, isLoading, respondToRequestMutation } = useAllRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<{id: string, subject: string, message: string, status: string} | null>(null);
  const itemsPerPage = 9;

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      response: '',
      status: 'en_proceso'
    }
  });

  // Apply filters and sorting
  const filteredRequests = allRequests?.filter(request => {
    const matchesSearch = !searchTerm || 
      request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'todos' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort the requests
  const sortedRequests = filteredRequests?.sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'status') {
      const statusOrder = { pendiente: 0, en_proceso: 1, completada: 2, rechazada: 3 };
      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    }
    return 0;
  });

  // Pagination
  const totalPages = sortedRequests ? Math.ceil(sortedRequests.length / itemsPerPage) : 0;
  const paginatedRequests = sortedRequests?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterApply = () => {
    setCurrentPage(1);
  };

  const openResponseDialog = (request: {id: string, subject: string, message: string, status: string}) => {
    form.reset({ response: '', status: request.status || 'en_proceso' });
    setSelectedRequest(request);
  };

  const handleResponseSubmit = (values: ResponseFormValues) => {
    if (selectedRequest) {
      respondToRequestMutation.mutate({
        requestId: selectedRequest.id,
        response: values.response,
        status: values.status
      }, {
        onSuccess: () => {
          form.reset();
          setSelectedRequest(null);
        }
      });
    }
  };

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

  return (
    <AdminLayout>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Gestión de Solicitudes</h2>
        <p className="text-sm text-gray-500">Administra todas las solicitudes recibidas</p>
      </div>
      
      {/* Filters */}
      <Card className="p-4 rounded-lg shadow mb-6">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="search-requests" className="sr-only">Buscar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="search-requests"
                  name="search-requests"
                  type="text"
                  placeholder="Buscar solicitudes"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <div className="w-full md:w-48">
                <label htmlFor="status" className="sr-only">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <label htmlFor="sort" className="sr-only">Ordenar por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                    <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleFilterApply}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Requests grid */}
      <Card className="rounded-lg shadow overflow-hidden">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : paginatedRequests && paginatedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{request.userName || "Usuario"}</div>
                        <div className="text-xs text-gray-500">{request.userEmail || "usuario@ejemplo.com"}</div>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{request.subject}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{request.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Creada el {new Date(request.createdAt).toLocaleDateString()}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => openResponseDialog(request)}
                    >
                      {request.response ? "Ver respuesta" : "Responder"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron solicitudes con los filtros aplicados.
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Response Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.response ? "Detalle de la solicitud" : "Responder a la solicitud"}</DialogTitle>
            <DialogDescription>
              {selectedRequest?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Mensaje del estudiante:</h4>
              <p className="mt-1 text-sm text-gray-600">{selectedRequest?.message}</p>
            </div>
            
            {selectedRequest?.response ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Respuesta:</h4>
                <p className="mt-1 text-sm text-gray-600">{selectedRequest.response}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Estado:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleResponseSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="response"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Respuesta</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escribe tu respuesta aquí..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_proceso">En proceso</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                            <SelectItem value="rechazada">Rechazada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedRequest(null)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={respondToRequestMutation.isPending}
                    >
                      {respondToRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar respuesta"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default RequestsPage;
