import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Request, insertRequestSchema } from "@shared/schema";
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
import { Loader2, Plus, MessageSquare } from "lucide-react";
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

export default function RequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/requests"],
    enabled: !!user,
  });

  // Setup form for new request
  const form = useForm({
    resolver: zodResolver(insertRequestSchema),
    defaultValues: {
      user_id: user?.id || "",
      subject: "",
      message: "",
    },
  });

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: { user_id: string; subject: string; message: string }) => {
      const res = await apiRequest("POST", "/api/requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      setNewRequestDialogOpen(false);
      form.reset({
        user_id: user?.id || "",
        subject: "",
        message: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al enviar la solicitud: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: { user_id: string; subject: string; message: string }) => {
    createRequestMutation.mutate(data);
  };

  // View request details
  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mis Solicitudes</CardTitle>
            <CardDescription>
              Realiza solicitudes académicas y administrativas.
            </CardDescription>
          </div>
          <Dialog open={newRequestDialogOpen} onOpenChange={setNewRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva solicitud
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva solicitud</DialogTitle>
                <DialogDescription>
                  Completa este formulario para enviar una nueva solicitud.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Solicitud de certificado de notas" {...field} />
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
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detalla tu solicitud aquí..." 
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
                        setNewRequestDialogOpen(false);
                        form.reset({
                          user_id: user?.id || "",
                          subject: "",
                          message: "",
                        });
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
                        "Enviar"
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
          ) : !requests || requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tienes solicitudes</h3>
              <p className="mt-2 text-sm text-gray-500">
                Comienza creando una nueva solicitud.
              </p>
              <Button
                className="mt-4"
                onClick={() => setNewRequestDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva solicitud
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request: Request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.subject}</TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="link" 
                          onClick={() => handleViewDetails(request)}
                        >
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Request Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Fecha</h4>
              <p className="mt-1 text-sm">
                {selectedRequest ? formatDate(selectedRequest.created_at) : ''}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Estado</h4>
              <p className="mt-1">
                <Badge variant={selectedRequest ? getStatusBadgeVariant(selectedRequest.status) : 'secondary'}>
                  {selectedRequest ? getStatusLabel(selectedRequest.status) : ''}
                </Badge>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Mensaje</h4>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {selectedRequest?.message}
              </p>
            </div>
            {selectedRequest?.response && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Respuesta</h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedRequest.response}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
