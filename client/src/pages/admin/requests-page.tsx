import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRequests } from "@/hooks/use-requests";
import { Request } from "@shared/schema";

// Tipos
interface RequestFilter {
  category: string;
  date: string;
  document: string;
}

const categories = [
  { value: "all", label: "Todas las categorías" },
  { value: "academic", label: "Académica" },
  { value: "financial", label: "Financiera" },
  { value: "administrative", label: "Administrativa" },
];

const statusColors = {
  pendiente: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  en_proceso: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  completada: "bg-green-100 text-green-800 hover:bg-green-100",
  rechazada: "bg-red-100 text-red-800 hover:bg-red-100",
};

export default function AdminRequestsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<RequestFilter>({
    category: "all",
    date: "",
    document: "",
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState<"pendiente" | "en_proceso" | "completada" | "rechazada">("en_proceso");

  const { 
    requests, 
    isLoading, 
    error,
    respondToRequestMutation 
  } = useRequests({
    onSuccess: () => {
      setSelectedRequest(null);
      setResponse("");
      setNewStatus("en_proceso");
    }
  });

  const handleFilterChange = (key: keyof RequestFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleResponseSubmit = async () => {
    if (!selectedRequest || !response) return;

    respondToRequestMutation.mutate({
      id: selectedRequest.id,
      data: {
        response,
        status: newStatus,
        respondedAt: new Date(),
      }
    });
  };

  // Filtrar solicitudes
  const filteredRequests = requests.filter(request => {
    if (filter.category !== "all" && request.subject.toLowerCase().includes(filter.category)) {
      return false;
    }
    if (filter.date && request.createdAt && 
        new Date(request.createdAt).toISOString().split('T')[0] !== filter.date) {
      return false;
    }
    if (filter.document && request.userId.toString().includes(filter.document)) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <p>Cargando solicitudes...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <p className="text-red-500">Error al cargar las solicitudes</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-bold">Gestión de Solicitudes</h1>
            <p className="text-muted-foreground mt-2">
              Administra y responde a las solicitudes de los estudiantes
            </p>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Filtra las solicitudes por categoría, fecha o número de documento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={filter.category}
                    onValueChange={(value) => handleFilterChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      id="date"
                      className="pl-10"
                      value={filter.date}
                      onChange={(e) => handleFilterChange("date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Documento de Identidad</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      id="document"
                      placeholder="Buscar por documento"
                      className="pl-10"
                      value={filter.document}
                      onChange={(e) => handleFilterChange("document", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Solicitudes */}
          <div className="grid gap-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    No se encontraron solicitudes que coincidan con los filtros
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.subject}</h3>
                          <Badge
                            variant="secondary"
                            className={statusColors[request.status as keyof typeof statusColors]}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>ID Usuario: {request.userId}</span>
                          <span>Fecha: {request.createdAt ? 
                            new Date(request.createdAt).toLocaleDateString() : 
                            'Fecha no disponible'
                          }</span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="ml-4"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Responder
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Responder Solicitud</DialogTitle>
                            <DialogDescription>
                              Responde a la solicitud del estudiante y actualiza su estado
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label>Detalles de la Solicitud</Label>
                              <Card className="p-4">
                                <p className="font-medium">{request.subject}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {request.message}
                                </p>
                              </Card>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="status">Estado</Label>
                              <Select
                                value={newStatus}
                                onValueChange={(value: "pendiente" | "en_proceso" | "completada" | "rechazada") => setNewStatus(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                                  <SelectItem value="completada">Completada</SelectItem>
                                  <SelectItem value="rechazada">Rechazada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="response">Respuesta</Label>
                              <Textarea
                                id="response"
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={handleResponseSubmit}
                              disabled={!response || respondToRequestMutation.isPending}
                            >
                              {respondToRequestMutation.isPending ? (
                                "Enviando..."
                              ) : (
                                "Enviar Respuesta"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 