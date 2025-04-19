import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Request, updateRequestSchema } from "@shared/schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge,
  BadgeProps
} from "@/components/ui/badge";
import { Loader2, Search, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Badge variants for request status
const getStatusBadgeVariant = (status: string): BadgeProps["variant"] => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Get status label
const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "approved":
      return "Aprobada";
    case "rejected":
      return "Rechazada";
    default:
      return status;
  }
};

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);

  // Fetch all requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/admin/requests"],
    enabled: !!user && (user.role === "admin" || user.role === "superuser"),
  });

  // Setup form for responding to requests
  const form = useForm({
    resolver: zodResolver(updateRequestSchema),
    defaultValues: {
      status: "pending" as const,
      response: "",
    },
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value });
  };

  // Handle date filter changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, endDate: e.target.value });
  };

  // Filter requests based on filters
  const filteredRequests = requests ? requests.filter((request: any) => {
    // Search filter (subject or student name)
    const searchMatch = !filters.search || 
      request.subject.toLowerCase().includes(filters.search.toLowerCase()) || 
      (request.profiles && request.profiles.full_name.toLowerCase().includes(filters.search.toLowerCase()));
    
    // Status filter
    const statusMatch = !filters.status || request.status === filters.status;
    
    // Date filter (created_at)
    const dateMatch = (!filters.startDate || new Date(request.created_at) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(request.created_at) <= new Date(filters.endDate));
    
    return searchMatch && statusMatch && dateMatch;
  }) : [];

  // Update request (respond) mutation
  const respondToRequestMutation = useMutation({
    mutationFn: async (data: { id: number, status: string, response: string }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest("PATCH", `/api/admin/requests/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Respuesta enviada",
        description: "La solicitud ha sido actualizada correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/requests"] });
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      form.reset({
        status: "pending",
        response: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al responder la solicitud: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: { status: string, response: string }) => {
    if (selectedRequest) {
      respondToRequestMutation.mutate({
        id: selectedRequest.id,
        ...data,
      });
    }
  };

  // Prepare to respond to a request
  const handleRespondClick = (request: Request) => {
    setSelectedRequest(request);
    form.reset({
      status: request.status as "pending" | "approved" | "rejected",
      response: request.response || "",
    });
    setResponseDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Solicitudes</CardTitle>
        <CardDescription>
          Administra las solicitudes de todos los estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-grow">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por asunto o estudiante"
                className="pl-10"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="sm:w-40">
            <Select 
              value={filters.status} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="sm:w-48">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="Desde"
                  value={filters.startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="Hasta"
                  value={filters.endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay solicitudes</h3>
            <p className="mt-2 text-sm text-gray-500">
              No se encontraron solicitudes en el sistema.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.profiles ? request.profiles.full_name : 'N/A'}
                    </TableCell>
                    <TableCell>{request.subject}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        onClick={() => handleRespondClick(request)}
                      >
                        {request.status === "pending" ? "Responder" : "Ver/Editar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === "pending" ? "Responder solicitud" : "Ver/Editar respuesta"}
            </DialogTitle>
            <DialogDescription>
              Solicitud: <span className="font-medium">{selectedRequest?.subject}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-2">
            <h4 className="text-sm font-medium text-gray-500">Mensaje del estudiante:</h4>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{selectedRequest?.message}</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="approved">Aprobada</SelectItem>
                        <SelectItem value="rejected">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResponseDialogOpen(false);
                    setSelectedRequest(null);
                  }}
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
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
