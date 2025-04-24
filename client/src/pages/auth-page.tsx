import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, registerUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerUserSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  // Formulario de inicio de sesión
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Formulario de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Manejador de envío de login
  const handleLogin = async (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const handleRegister = (values: RegisterFormValues) => {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };

  // Redireccionar a home si ya hay sesión
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-0 min-h-screen">
      {/* Formulario de autenticación */}
      <div className="flex flex-col items-center justify-center p-4 md:p-8">
        <div className="mx-auto max-w-md space-y-6 w-full">
          <div className="text-center mb-8 flex flex-col items-center">
            {/* Logo ETC según el manual de marca */}
            <div className="flex flex-col items-center mb-4">
              <div className="text-primary text-4xl font-bold mb-1">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="h-1.5 w-14 bg-primary mr-1"></div>
                    <div className="h-1.5 w-8 bg-primary"></div>
                  </div>
                  <div className="mt-1.5 h-1.5 w-8 bg-primary"></div>
                  <div className="mt-1.5 h-1.5 w-8 bg-primary"></div>
                </div>
              </div>
              <h1 className="text-lg font-semibold tracking-wide text-primary mt-2">PORTAL DEL ESTUDIANTE</h1>
            </div>
            <p className="text-foreground font-medium">Gestión de documentos y solicitudes</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* Tab de inicio de sesión */}
            <TabsContent value="login">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-foreground">Iniciar Sesión</CardTitle>
                  <CardDescription className="text-foreground/80 font-medium">
                    Ingresa tus credenciales para acceder a tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(handleLogin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nombre de usuario" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Contraseña" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          "Iniciar Sesión"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de registro */}
            <TabsContent value="register">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-foreground">Crear una cuenta</CardTitle>
                  <CardDescription className="text-foreground/80 font-medium">
                    Regístrate para acceder al portal estudiantil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(handleRegister)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nombre de usuario" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Contraseña" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Contraseña</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirmar contraseña" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          "Registrarse"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sección descriptiva */}
      <div className="bg-secondary text-secondary-foreground p-8 hidden md:flex flex-col items-center justify-center">
        <div className="max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">Bienvenido al Portal Estudiantil</h2>
            <p className="text-xl mb-2 text-white/90 font-medium">
              La plataforma integral para la gestión de documentos y solicitudes académicas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Gestión Documental</h3>
              <p className="text-white/90">
                Sube, organiza y monitorea el estado de tus documentos académicos.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Solicitudes</h3>
              <p className="text-white/90">
                Realiza y da seguimiento a tus solicitudes administrativas.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Comunicación Directa</h3>
              <p className="text-white/90">
                Mantén contacto directo con administradores para resolver tus dudas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}