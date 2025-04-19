import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useProfiles } from '@/hooks/use-profiles';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  fullName: z.string().min(3, "Nombre completo es requerido"),
  documentType: z.string().min(1, "Tipo de documento es requerido"),
  documentNumber: z.string().min(5, "Número de documento es requerido"),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de nacimiento inválida",
  }),
  phone: z.string().min(7, "Teléfono es requerido"),
  city: z.string().min(2, "Ciudad es requerida"),
  address: z.string().min(5, "Dirección es requerida"),
});

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, isLoading, updateProfileMutation } = useProfiles(user?.id);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      documentType: '',
      documentNumber: '',
      birthDate: '',
      phone: '',
      city: '',
      address: '',
    }
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        documentType: profile.documentType,
        documentNumber: profile.documentNumber,
        birthDate: new Date(profile.birthDate).toISOString().split('T')[0],
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
      });
    }
  }, [profile, form]);

  const handleUpdateProfile = (values: z.infer<typeof profileFormSchema>) => {
    if (user?.id) {
      updateProfileMutation.mutate({
        id: user.id,
        ...values
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
        <p className="text-sm text-gray-500">Actualiza tu información de contacto y datos personales</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdateProfile)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="profile-full-name">Nombre completo</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-full-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="profile-email" className="text-sm font-medium text-gray-700">Correo electrónico</label>
              <Input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
              />
            </div>
            
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="profile-document-type">Tipo de documento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="profile-document-type">
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
                  <FormLabel htmlFor="profile-document-number">Número de documento</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-document-number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="profile-birth-date">Fecha de nacimiento</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-birth-date"
                      type="date"
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
                  <FormLabel htmlFor="profile-phone">Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-phone"
                      type="tel"
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
                  <FormLabel htmlFor="profile-city">Ciudad</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-city"
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
                  <FormLabel htmlFor="profile-address">Dirección</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="mr-3"
              onClick={() => form.reset()}
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
                <>Guardar cambios</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;
