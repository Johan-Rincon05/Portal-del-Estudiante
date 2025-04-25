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
import { useToast } from '@/components/ui/use-toast';

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
  methodology: z.enum(['presencial', 'virtual', 'distancia']),
  degreeTitle: z.string().min(1, 'El título a obtener es requerido'),
  subscriptionType: z.enum(['nuevo', 'reingreso', 'transferencia']),
  applicationMethod: z.enum(['online', 'presencial']),
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
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      documentType: 'cc',
      documentNumber: '',
      birthDate: '',
      birthPlace: '',
      personalEmail: '',
      icfesAc: '',
      phone: '',
      city: '',
      address: '',
      neighborhood: '',
      locality: '',
      socialStratum: '1',
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
        socialStratum: profile.socialStratum?.toString() || '1',
        address: profile.address || '',
        documentType: profile.documentType || 'cc',
        documentNumber: profile.documentNumber || '',
        birthPlace: profile.birthPlace || '',
        personalEmail: profile.personalEmail || '',
        phone: profile.phone || '',
        city: profile.city || '',
        neighborhood: profile.neighborhood || '',
        locality: profile.locality || '',
        bloodType: profile.bloodType || 'O+',
        maritalStatus: profile.maritalStatus || 'soltero',
        conflictVictim: profile.conflictVictim ?? false,
        icfesAc: profile.icfesAc || ''
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo identificar el usuario"
        });
        return;
      }

      // Actualizar perfil
      await updateProfileMutation.mutateAsync({
        userId: Number(userId),
        ...profileData,
        birthDate: new Date(profileData.birthDate)
      } as any);

      // Actualizar datos universitarios si hay universidad seleccionada
      if (universityId) {
        await updateUniversityDataMutation.mutateAsync({
          userId: userId,
          universityId,
          programId: programId || 0,
          academicPeriod,
          studyDuration,
          methodology,
          degreeTitle,
          subscriptionType,
          applicationMethod,
          severancePaymentUsed
        });
      }

      toast({
        title: "Éxito",
        description: "Perfil actualizado exitosamente"
      });
      
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el perfil"
      });
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
        <p className="text-sm text-gray-500">Actualiza tu información de contacto y datos personales</p>
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
              <label htmlFor="profile-email" className="text-sm font-medium text-gray-700">Correo electrónico</label>
              <Input
                id="profile-email"
                type="email"
                value={user?.username || ''}
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
              name="birthPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar de nacimiento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Bogotá" />
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
                    <Input {...field} type="email" placeholder="correo@ejemplo.com" />
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

            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="profile-neighborhood">Barrio</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-neighborhood"
                      {...field}
                    />
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
                  <FormLabel htmlFor="profile-locality">Localidad</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-locality"
                      {...field}
                    />
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
                  <FormLabel htmlFor="profile-social-stratum">Estrato social</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="profile-social-stratum">
                        <SelectValue placeholder="Seleccionar" />
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
                  <FormLabel htmlFor="profile-blood-type">Tipo de sangre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="profile-blood-type">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
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
                <FormItem>
                  <FormLabel>¿Es víctima del conflicto armado?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value ? "true" : "false"}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="conflict-victim-yes" />
                        <label htmlFor="conflict-victim-yes">Sí</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="conflict-victim-no" />
                        <label htmlFor="conflict-victim-no">No</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="profile-marital-status">Estado civil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="profile-marital-status">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="union_libre">Unión libre</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viudo">Viudo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Información Universitaria</h3>
              <p className="text-sm text-gray-500">Completa tu información académica</p>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2024-1">2024-1</SelectItem>
                        <SelectItem value="2024-2">2024-2</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar duración" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="4_semestres">4 semestres</SelectItem>
                          <SelectItem value="6_semestres">6 semestres</SelectItem>
                          <SelectItem value="8_semestres">8 semestres</SelectItem>
                          <SelectItem value="10_semestres">10 semestres</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar metodología" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="distancia">A distancia</SelectItem>
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
                        <Input {...field} placeholder="Ej: Ingeniero de Sistemas" />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="online">En línea</SelectItem>
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Cesantías utilizadas
                        </FormLabel>
                        <p className="text-sm text-gray-500">
                          Indica si utilizarás tus cesantías para el pago
                        </p>
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
              className="bg-primary text-white hover:bg-primary-600"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;
