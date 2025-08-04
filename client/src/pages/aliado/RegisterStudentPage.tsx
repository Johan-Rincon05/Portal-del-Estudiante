import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AliadoLayout } from "@/components/layouts/AliadoLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Schema de validación para el formulario
const registerStudentSchema = z.object({
  fullName: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  documentType: z.enum(["cedula", "pasaporte", "tarjeta_identidad"]),
  documentNumber: z.string().min(1, "El número de documento es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  city: z.string().min(1, "La ciudad es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
});

type RegisterStudentForm = z.infer<typeof registerStudentSchema>;

export default function RegisterStudentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterStudentForm>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: {
      documentType: "cedula",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterStudentForm) => {
      return apiRequest("/api/aliado/students", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Estudiante registrado",
        description: "El estudiante ha sido registrado exitosamente.",
      });
      setLocation("/aliado/students");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Hubo un error al registrar el estudiante. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterStudentForm) => {
    registerMutation.mutate(data);
  };

  return (
    <AliadoLayout>
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Estudiante</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cedula">Cédula</SelectItem>
                            <SelectItem value="pasaporte">Pasaporte</SelectItem>
                            <SelectItem value="tarjeta_identidad">
                              Tarjeta de Identidad
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Documento</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="300 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Bogotá" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle 123 #45-67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registrando..." : "Registrar Estudiante"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AliadoLayout>
  );
}