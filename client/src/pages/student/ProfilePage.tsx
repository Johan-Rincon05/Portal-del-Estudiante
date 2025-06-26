import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useProfiles } from '@/hooks/use-profiles';
import { useAuth } from '@/hooks/use-auth';
import { useUniversityData, useUpdateUniversityData } from '@/hooks/use-university-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UniversityProgramSelect, universityProgramSchema } from '@/components/UniversityProgramSelect';
import { toast } from 'sonner';
import { StudentLayout } from '@/components/layouts/StudentLayout';

const profileFormSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  birthPlace: z.string().min(1, 'El lugar de nacimiento es requerido'),
  personalEmail: z.string().email('Correo electrónico inválido'),
  icfesAc: z.string().optional(),
  phone: z.string().min(1, 'El teléfono es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  address: z.string().min(1, 'La dirección es requerida'),
  neighborhood: z.string().min(1, 'El barrio es requerido'),
  locality: z.string().min(1, 'La localidad es requerida'),
  socialStratum: z.string().min(1, 'El estrato social es requerido'),
  bloodType: z.string().min(1, 'El tipo de sangre es requerido'),
  conflictVictim: z.boolean(),
  maritalStatus: z.string().min(1, 'El estado civil es requerido'),
  ...universityProgramSchema.shape,
  academicPeriod: z.string().min(1, 'El periodo académico es requerido'),
  studyDuration: z.string().min(1, 'La duración de estudios es requerida'),
  methodology: z.enum(['presencial', 'virtual', 'distancia']).nullable(),
  degreeTitle: z.string().min(1, 'El título a obtener es requerido'),
  subscriptionType: z.enum(['nuevo', 'reingreso', 'transferencia']).nullable(),
  applicationMethod: z.enum(['online', 'presencial']).nullable(),
  severancePaymentUsed: z.boolean()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const userId = user?.id?.toString();
  const { profile, isLoading, updateProfileMutation } = useProfiles(userId);
  const { data: universityData, isLoading: isLoadingUniversityData } = useUniversityData(userId);
  const updateUniversityDataMutation = useUpdateUniversityData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      documentType: 'cc',
      documentNumber: '',
      email: '',
      address: '',
      phone: '',
      birthDate: '',
      gender: 'masculino',
      socialStratum: 1,
      bloodType: 'O+',
      conflictVictim: false,
      maritalStatus: 'soltero',
      universityId: undefined,
      programId: undefined,
      academicPeriod: '',
      studyDuration: '',
      methodology: 'presencial',
      degreeTitle: '',
      subscriptionType: 'nuevo',
      applicationMethod: 'online',
      severancePaymentUsed: false
    }
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        ...form.getValues(),
        ...profile,
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (universityData) {
      form.reset({
        ...form.getValues(),
        universityId: universityData.universityId,
        programId: universityData.programId,
        academicPeriod: universityData.academicPeriod ?? '',
        studyDuration: universityData.studyDuration ?? '',
        methodology: universityData.methodology ?? 'presencial',
        degreeTitle: universityData.degreeTitle ?? '',
        subscriptionType: universityData.subscriptionType ?? 'nuevo',
        applicationMethod: universityData.applicationMethod ?? 'online',
        severancePaymentUsed: universityData.severancePaymentUsed ?? false
      });
    }
  }, [universityData]);

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);

      const {
        universityId,
        programId,
        academicPeriod,
        studyDuration,
        methodology,
        degreeTitle,
        subscriptionType,
        applicationMethod,
        severancePaymentUsed,
        ...profileData
      } = values;

      if (!userId) {
        toast.error('Error: No se pudo identificar el usuario');
        return;
      }

      // Actualizar perfil
      await updateProfileMutation.mutateAsync({
        userId,
        ...profileData
      });

      // Actualizar datos universitarios si hay universidad seleccionada
      if (universityId) {
        await updateUniversityDataMutation.mutateAsync({
          userId,
          universityId,
          programId,
          academicPeriod,
          studyDuration,
          methodology,
          degreeTitle,
          subscriptionType,
          applicationMethod,
          severancePaymentUsed
        });
      }

      toast.success('Perfil actualizado exitosamente');
      
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingUniversityData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <StudentLayout>
      <div className="bg-card rounded-lg shadow p-6 border">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Información personal</h2>
          <p className="text-sm text-muted-foreground">Actualiza tu información de contacto y datos personales</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-8">
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
                <label htmlFor="profile-email" className="text-sm font-medium text-foreground">Correo electrónico</label>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.username || ''}
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de documento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de documento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                        <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="pp">Pasaporte</SelectItem>
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
                    <FormLabel>Número de documento</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar de nacimiento</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="personalEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo personal</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="icfesAc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AC ICFES</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: AC202301234" />
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
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barrio</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localidad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialStratum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estrato social</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Estrato 1</SelectItem>
                        <SelectItem value="2">Estrato 2</SelectItem>
                        <SelectItem value="3">Estrato 3</SelectItem>
                        <SelectItem value="4">Estrato 4</SelectItem>
                        <SelectItem value="5">Estrato 5</SelectItem>
                        <SelectItem value="6">Estrato 6</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de sangre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de sangre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conflictVictim"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        ¿Eres víctima del conflicto armado?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado civil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estado civil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="soltero">Soltero</SelectItem>
                        <SelectItem value="casado">Casado</SelectItem>
                        <SelectItem value="union_libre">Unión Libre</SelectItem>
                        <SelectItem value="divorciado">Divorciado</SelectItem>
                        <SelectItem value="viudo">Viudo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground">Información Universitaria</h3>
                <p className="text-sm text-muted-foreground">Completa tu información académica</p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="universityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Universidad</FormLabel>
                        <UniversityProgramSelect 
                          form={form as any}
                          onUniversityChange={(id) => {
                            field.onChange(id);
                            form.setValue('programId', undefined);
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="academicPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Periodo académico</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: 2024-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="studyDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración de estudios</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: 8 semestres" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="methodology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metodología</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la metodología" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="presencial">Presencial</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="distancia">Distancia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="degreeTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título a obtener</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriptionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de inscripción</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de inscripción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nuevo">Nuevo</SelectItem>
                            <SelectItem value="reingreso">Reingreso</SelectItem>
                            <SelectItem value="transferencia">Transferencia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicationMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de aplicación</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el método de aplicación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="presencial">Presencial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severancePaymentUsed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            ¿Usaste pago de cesantías?
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </StudentLayout>
  );
};

export default ProfilePage;
