import { Link, useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { registerUserSchema } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail } from 'lucide-react';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';
import { useState } from 'react';

const RegisterPage = () => {
  const { user, isLoading, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      documentType: '',
      documentNumber: '',
      birthDate: '',
      phone: '',
      city: '',
      address: '',
      password: '',
      confirmPassword: '',
    }
  });

  const handleRegister = (values: z.infer<typeof registerUserSchema>) => {
    // Guardar el email para mostrar en el modal de verificación
    setRegisteredEmail(values.email);
    
    // Simular el registro exitoso y mostrar modal de verificación
    // TODO: Implementar lógica real de registro
    setShowVerificationModal(true);
    
    // registerMutation.mutate(values);
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    setLocation('/home');
  };

  // Redirect if already logged in
  if (user && !isLoading) {
    const userRole = user.user_metadata?.role || 'estudiante';
    
    if (userRole === 'superuser') {
      setLocation('/admin/users');
      return null;
    } else if (userRole === 'SuperAdministrativos') {
      setLocation('/admin/students');
      return null;
    } else {
      setLocation('/profile');
      return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Portal del Estudiante</h1>
          <h2 className="text-xl font-medium text-gray-700">Registro de estudiante</h2>
          <p className="mt-2 text-sm text-gray-600">Crea tu cuenta para acceder al portal</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegister)} className="mt-6 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="full-name">Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        id="full-name"
                        placeholder="Juan Pérez"
                        required
                        {...field}
                      />
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
                    <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="ejemplo@correo.com"
                        required
                        {...field}
                      />
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
                      <FormLabel htmlFor="document-type">Tipo de documento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger id="document-type">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cedula">Cédula</SelectItem>
                          <SelectItem value="pasaporte">Pasaporte</SelectItem>
                          <SelectItem value="tarjeta_identidad">Tarjeta de identidad</SelectItem>
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
                      <FormLabel htmlFor="document-number">Número de documento</FormLabel>
                      <FormControl>
                        <Input
                          id="document-number"
                          placeholder="12345678"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="birth-date">Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input
                        id="birth-date"
                        type="date"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="phone">Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="3001234567"
                        required
                        {...field}
                      />
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
                    <FormLabel htmlFor="city">Ciudad</FormLabel>
                    <FormControl>
                      <Input
                        id="city"
                        placeholder="Bogotá"
                        required
                        {...field}
                      />
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
                    <FormLabel htmlFor="address">Dirección</FormLabel>
                    <FormControl>
                      <Input
                        id="address"
                        placeholder="Calle 123 # 45-67"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="register-password">Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirm-password">Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirma tu contraseña"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center">
              <Checkbox id="agree-terms" required />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                Acepto los términos y condiciones
              </label>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>Registrarme</>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta? 
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Modal de verificación de email */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={registeredEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default RegisterPage;
