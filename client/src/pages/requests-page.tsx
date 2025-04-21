import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRequests } from "@/hooks/use-requests";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Clock, CheckCircle, XCircle, Loader2, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const requestFormSchema = z.object({
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  area: z.enum(["academica", "documental", "cartera"], {
    required_error: "Por favor seleccione un área",
  }),
  message: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export default function RequestsPage() {
  const { user } = useAuth();
  const { requests = [], createRequestMutation, isLoading } = useRequests();
  const [statusFilter, setStatusFilter] = useState("all");

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      subject: "",
      area: undefined,
      message: "",
    },
  });

  const onSubmit = (values: RequestFormValues) => {
    createRequestMutation.mutate({
      subject: `${values.area.toUpperCase()}: ${values.subject}`,
      message: values.message
    }, {
      onSuccess: () => {
        form.reset();
        toast.success("Solicitud enviada", {
          description: "Tu solicitud ha sido enviada exitosamente"
        });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "en_proceso":
        return "bg-blue-100 text-blue-800";
      case "completada":
        return "bg-green-100 text-green-800";
      case "rechazada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Clock className="h-4 w-4" />;
      case "en_proceso":
        return <Clock className="h-4 w-4" />;
      case "completada":
        return <CheckCircle className="h-4 w-4" />;
      case "rechazada":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendiente":
        return "Pendiente";
      case "en_proceso":
        return "En proceso";
      case "completada":
        return "Completada";
      case "rechazada":
        return "Rechazada";
      default:
        return status;
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  });

  return (
    <StudentLayout>
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario de Solicitud */}
          <Card>
            <CardHeader>
              <CardTitle>Nueva Solicitud</CardTitle>
              <CardDescription>
                Completa el formulario para enviar una nueva solicitud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Escribe el asunto de tu solicitud" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un área" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="academica">Académica</SelectItem>
                            <SelectItem value="documental">Documental</SelectItem>
                            <SelectItem value="cartera">Cartera</SelectItem>
                          </SelectContent>
                        </Select>
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
                            placeholder="Describe tu solicitud en detalle" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createRequestMutation.isPending} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Solicitud
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Lista de Solicitudes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historial de Solicitudes</CardTitle>
                  <CardDescription>
                    Visualiza y da seguimiento a tus solicitudes
                  </CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendientes</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="completada">Completadas</SelectItem>
                    <SelectItem value="rechazada">Rechazadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay solicitudes para mostrar
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <Card key={request.id} className="bg-card/60">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              <h3 className="font-medium">{request.subject}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.message}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                Creada el {request.createdAt ? formatDate(request.createdAt) : 'Fecha no disponible'}
                              </span>
                              <Badge variant="secondary" className={getStatusColor(request.status)}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1">{getStatusText(request.status)}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
} 