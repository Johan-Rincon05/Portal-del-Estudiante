import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Profile, Document, Request, updateRequestSchema } from "@shared/schema";
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
  Badge,
  BadgeProps
} from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "wouter";
import { z } from "zod";
import { supabase, getFileUrl } from "@/lib/supabase";

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

// Document type label
const getDocumentTypeLabel = (type: string) => {
  switch (type) {
    case "cedula":
      return "Cédula";
    case "diploma":
      return "Diploma";
    case "acta":
      return "Acta";
    case "foto":
      return "Foto";
    case "recibo":
      return "Recibo";
    case "formulario":
      return "Formulario";
    default:
      return type;
  }
};

// Response form schema
const responseFormSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  response: z.string().min(1, "La respuesta es obligatoria"),
});

type ResponseFormData = z.infer<typeof responseFormSchema>;

export default function StudentDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  
  // Fetch student profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/admin/profiles/${id}`],
    enabled: !!user && !!id && (user.role === "admin" || user.role === "superuser"),
  });
  
  // Fetch student documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: [`/api/admin/documents/${id}`],
    enabled: !!user && !!id && (user.role === "admin" || user.role === "superuser"),
  });
  
  // Fetch student requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: [`/api/admin/requests/${id}`],
    enabled: !!user && !!id && (user.role === "admin" || user.role === "superuser"),
  });
  
  // Setup form for profile edit
  const profileForm = useForm({
    resolver: zodResolver(z.object({
      full_name: z.string().min(1, "El nombre es obligatorio"),
      email: z.string().email("Email inválido"),
      document_type: z.string().min(1, "El tipo de documento es obligatorio"),
      document_number: z.string().min(1, "El número de documento es obligatorio"),
      birth_date: z.date(),
      phone: z.string().min(1, "El teléfono es obligatorio"),
      city: z.string().min(1, "La ciudad es obligatoria"),
      address: z.string().min(1, "La dirección es obligatoria"),
    })),
    defaultValues: {
      full_name: "",
      email: "",
      document_type: "",
      document_number: "",
      birth_date: new Date(),
      phone: "",
      city: "",
      address: "",
    },
  });
  
  // Response form
  const responseForm = useForm({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      status: "pending" as const,
      response: "",
    },
  });
  
  // Update form values when profile data is loaded
  useState(() => {
    if (profile) {
      profileForm.reset({
        ...profile,
        birth_date: new Date(profile.birth_date),
      });
    }
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Omit<Profile, "id" | "created_at">) => {
      const res = await apiRequest("PUT", `/api/admin/profiles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "La información del estudiante ha sido actualizada correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/profiles/${id}`] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar el perfil: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const res = await apiRequest("DELETE", `/api/documents/${documentId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/documents/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update request (respond) mutation
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, data }: { requestId: number, data: ResponseFormData }) => {
      const res = await apiRequest("PATCH", `/api/admin/requests/${requestId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Respuesta enviada",
        description: "La solicitud ha sido actualizada correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/requests/${id}`] });
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      responseForm.reset({
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
  
  // Handle profile form submission
  const onProfileSubmit = (data: Omit<Profile, "id" | "created_at">) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle response form submission
  const onResponseSubmit = (data: ResponseFormData) => {
    if (selectedRequest) {
      respondToRequestMutation.mutate({
        requestId: selectedRequest.id,
        data
      });
    }
  };
  
  // Handle document download
  const handleDownloadDocument = (document: Document) => {
    const url = getFileUrl("documents", document.path);
    window.open(url, "_blank");
  };
  
  // Prepare to respond to a request
  const handlePrepareResponse = (request: Request) => {
    setSelectedRequest(request);
    responseForm.reset({
      status: request.status as "pending" | "approved" | "rejected",
      response: request.response || "",
    });
    setResponseDialogOpen(true);
  };
  
  // Loading state
  const isLoading = profileLoading || documentsLoading || requestsLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If student not found
  if (!profile) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Estudiante no encontrado</h3>
        <p className="mt-2 text-sm text-gray-500">
          El estudiante que buscas no existe o no tienes permisos para verlo.
        </p>
        <Link href="/admin/students">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href="/admin/students">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
        </Link>
      </div>
      
      {/* Student Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Información del Estudiante</CardTitle>
            <CardDescription>
              Detalles personales y académicos
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          )}
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Juan Pérez" 
                          {...field} 
                          disabled={!isEditing} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ejemplo@correo.com" 
                          type="email" 
                          {...field} 
                          disabled={true} // Email cannot be changed
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="document_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de documento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cedula">Cédula</SelectItem>
                          <SelectItem value="pasaporte">Pasaporte</SelectItem>
                          <SelectItem value="extranjeria">Tarjeta de Extranjería</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="document_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de documento</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          disabled={!isEditing}
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            field.onChange(new Date(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      if (profile) {
                        profileForm.reset({
                          ...profile,
                          birth_date: new Date(profile.birth_date),
                        });
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Student Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Archivos subidos por el estudiante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">El estudiante no ha subido documentos.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documents.map((document: Document) => (
                <li key={document.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <p className="ml-3 text-sm font-medium text-gray-900">
                        {getDocumentTypeLabel(document.type)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2 text-primary-600 hover:text-primary-700"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        {deleteDocumentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Subido el {formatDate(document.uploaded_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      {/* Student Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes</CardTitle>
          <CardDescription>
            Solicitudes realizadas por el estudiante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">El estudiante no ha realizado solicitudes.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {requests.map((request: Request) => (
                <li key={request.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600">{request.subject}</p>
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Creada el {formatDate(request.created_at)}
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{request.message}</p>
                  </div>
                  {request.response && (
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Respuesta:</h4>
                      <p className="text-sm text-gray-700">{request.response}</p>
                    </div>
                  )}
                  <div className="mt-3">
                    <Button
                      size="sm"
                      onClick={() => handlePrepareResponse(request)}
                    >
                      {request.response ? "Editar respuesta" : "Responder"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      {/* Respond Request Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder solicitud</DialogTitle>
            <DialogDescription>
              Solicitud: <span className="font-medium">{selectedRequest?.subject}</span>
            </DialogDescription>
          </DialogHeader>
          
          <Form {...responseForm}>
            <form onSubmit={responseForm.handleSubmit(onResponseSubmit)} className="space-y-4">
              <FormField
                control={responseForm.control}
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
                control={responseForm.control}
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
                    responseForm.reset({
                      status: "pending",
                      response: "",
                    });
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
    </div>
  );
}
