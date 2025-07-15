import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserSchema } from '@shared/schema';
import SuperAdminLayout from "@/layouts/SuperAdminLayout";

type EditUserFormValues = z.infer<typeof createUserSchema>;

const UserEditPage = () => {
  const [, params] = useRoute('/admin/users/:userId/edit');
  const userId = params?.userId;
  const { user } = useAuth();

  // Mock user data - this would be replaced with actual data from Supabase
  const userData = {
    id: userId,
    name: 'Carlos Rodríguez',
    email: 'carlos@ejemplo.com',
    role: 'estudiante',
    status: 'active',
    createdAt: '2023-03-12',
    lastLogin: '2023-04-15'
  };

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: userData.email,
      password: '',
      role: userData.role
    }
  });

  const handleEditUser = (values: EditUserFormValues) => {
    // Logic to update user
    console.log('User updated:', values);
  };

  return (
    <SuperAdminLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Editar Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditUser)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="user-email">Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="nuevo@ejemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="user-role">Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger id="user-role">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="estudiante">Estudiante</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="superuser">Superusuario</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="user-password">Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          id="user-password"
                          type="password"
                          placeholder="Contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SuperAdminLayout>
  );
};

export default UserEditPage; 