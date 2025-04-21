import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, User, ArrowLeft, Camera, Upload } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StudentLayout } from "@/components/layouts/StudentLayout";

const profileFormSchema = z.object({
  nombres: z.string(),
  apellidos: z.string(),
  tipoDocumento: z.string(),
  numeroDocumento: z.string(),
  lugarNacimiento: z.string().min(2, "El lugar de nacimiento es requerido"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  direccion: z.string().min(5, "La dirección es requerida"),
  barrio: z.string().min(2, "El barrio es requerido"),
  localidad: z.string().min(2, "La localidad es requerida"),
  estrato: z.string().min(1, "El estrato es requerido"),
  celular: z.string().min(10, "El número de celular debe tener al menos 10 dígitos"),
  correoPersonal: z.string().email("Correo electrónico inválido"),
  tipoSangre: z.string().min(1, "El tipo de sangre es requerido"),
  victimaConflicto: z.enum(["si", "no"]),
  acIcfes: z.string().min(1, "El AC ICFES es requerido"),
  estadoCivil: z.enum(["soltero", "casado", "unionLibre", "divorciado", "viudo"]),
  programaAdmitido: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nombres: "John",
      apellidos: "Doe",
      tipoDocumento: "CC",
      numeroDocumento: "1234567890",
      lugarNacimiento: "",
      fechaNacimiento: "",
      ciudad: "",
      direccion: "",
      barrio: "",
      localidad: "",
      estrato: "",
      celular: "",
      correoPersonal: "",
      tipoSangre: "",
      victimaConflicto: "no",
      acIcfes: "",
      estadoCivil: "soltero",
      programaAdmitido: "Ingeniería de Sistemas",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    console.log(values);
    // Aquí iría la lógica para actualizar el perfil
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <StudentLayout>
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Mi Perfil</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>

          {/* Información del usuario */}
          <Card className="bg-card/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-background shadow-md">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback>
                    <User className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">{user?.username}</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                      {user?.role}
                    </span>
                    <Label htmlFor="picture" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                        Cambiar foto
                      </div>
                      <Input
                        id="picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Datos personales */}
                    <FormField
                      control={form.control}
                      name="nombres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Nombres</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apellidos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Apellidos</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipoDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Tipo de Documento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                              <SelectItem value="PA">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numeroDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Número de Documento</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lugarNacimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Lugar de Nacimiento</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fechaNacimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Fecha de Nacimiento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ciudad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Ciudad</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Dirección</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="barrio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Barrio</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="localidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Localidad</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estrato"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Estrato</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Selecciona el estrato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map((estrato) => (
                                <SelectItem key={estrato} value={estrato.toString()}>
                                  {estrato}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="celular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Celular</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="correoPersonal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Correo Personal</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipoSangre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Tipo de Sangre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Selecciona tu tipo de sangre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>
                                  {tipo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="victimaConflicto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">¿Víctima del Conflicto?</FormLabel>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="si" id="victima-si" />
                              <Label htmlFor="victima-si" className="text-foreground">Sí</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="victima-no" />
                              <Label htmlFor="victima-no" className="text-foreground">No</Label>
                            </div>
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acIcfes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">AC ICFES</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estadoCivil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Estado Civil</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Selecciona tu estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="soltero">Soltero/a</SelectItem>
                              <SelectItem value="casado">Casado/a</SelectItem>
                              <SelectItem value="unionLibre">Unión Libre</SelectItem>
                              <SelectItem value="divorciado">Divorciado/a</SelectItem>
                              <SelectItem value="viudo">Viudo/a</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="programaAdmitido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Programa Admitido</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="bg-muted/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border">
                    <Button type="submit" size="lg" className="w-full md:w-auto gap-2">
                      <Upload className="h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
} 