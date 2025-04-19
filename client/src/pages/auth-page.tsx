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

  // Manejadores de envío
  const handleLogin = async (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        // Redirección a la página principal después del login
        window.location.href = "/";
      }
    });
  };

  const handleRegister = (values: RegisterFormValues) => {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
    }, {
      onSuccess: () => {
        // Redirección a la página principal después del registro
        window.location.href = "/";
      }
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Portal Estudiantil</h1>
            <p className="text-muted-foreground">Gestión de documentos y solicitudes</p>
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
                  <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                  <CardDescription>
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
                        className="w-full"
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
                  <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
                  <CardDescription>
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
                        className="w-full"
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
      <div className="bg-primary text-primary-foreground p-8 hidden md:flex flex-col items-center justify-center">
        <div className="max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Bienvenido al Portal Estudiantil</h2>
            <p className="text-xl mb-2">
              La plataforma integral para la gestión de documentos y solicitudes académicas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Gestión Documental</h3>
              <p>
                Sube, organiza y monitorea el estado de tus documentos académicos.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Solicitudes</h3>
              <p>
                Realiza y da seguimiento a tus solicitudes administrativas.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Comunicación Directa</h3>
              <p>
                Mantén contacto directo con administradores para resolver tus dudas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}