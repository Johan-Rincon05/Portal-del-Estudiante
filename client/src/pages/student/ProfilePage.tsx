import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useProfiles } from '@/hooks/use-profiles';
import { useUniversityData, useUpdateUniversityData } from '@/hooks/use-university-data';
import { Loader2, User, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UniversityProgramSelect, universityProgramSchema } from '@/components/UniversityProgramSelect';
import { toast } from 'sonner';
import { StudentLayout } from '@/components/layouts/StudentLayout';

const profileFormSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  documentType: z.string().nullable().optional(),
  documentNumber: z.string().nullable().optional(),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  birthPlace: z.string().nullable().optional(),
  personalEmail: z.string().email('Correo electrónico inválido').nullable().optional(),
  icfesAc: z.string().nullable().optional(),
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
  academicPeriod: z.string().nullable().optional(),
  studyDuration: z.string().nullable().optional(),
  methodology: z.enum(['presencial', 'virtual', 'distancia']).nullable().optional(),
  degreeTitle: z.string().nullable().optional(),
  subscriptionType: z.enum(['nuevo', 'reingreso', 'transferencia']).nullable().optional(),
  applicationMethod: z.enum(['online', 'presencial']).nullable().optional(),
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
      personalEmail: '',
      address: '',
      phone: '',
      birthDate: '',
      birthPlace: '',
      icfesAc: '',
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
        fullName: profile.fullName || '',
        documentType: profile.documentType || 'cc',
        documentNumber: profile.documentNumber || '',
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
        birthPlace: profile.birthPlace || '',
        personalEmail: profile.personalEmail || '',
        icfesAc: profile.icfesAc || '',
        phone: profile.phone || '',
        city: profile.city || '',
        address: profile.address || '',
        neighborhood: profile.neighborhood || '',
        locality: profile.locality || '',
        socialStratum: profile.socialStratum?.toString() || '1',
        bloodType: profile.bloodType || 'O+',
        conflictVictim: profile.conflictVictim || false,
        maritalStatus: profile.maritalStatus || 'soltero',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (universityData && typeof universityData === 'object' && 'universityId' in universityData) {
      const data = universityData as any;
      form.reset({
        ...form.getValues(),
        universityId: data.universityId,
        programId: data.programId,
        academicPeriod: data.academicPeriod || '',
        studyDuration: data.studyDuration || '',
        methodology: data.methodology || 'presencial',
        degreeTitle: data.degreeTitle || '',
        subscriptionType: data.subscriptionType || 'nuevo',
        applicationMethod: data.applicationMethod || 'online',
        severancePaymentUsed: data.severancePaymentUsed || false
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
        ...profileData,
        birthDate: new Date(profileData.birthDate),
        documentType: profileData.documentType || null,
        documentNumber: profileData.documentNumber || null,
        birthPlace: profileData.birthPlace || null,
        personalEmail: profileData.personalEmail || null,
        icfesAc: profileData.icfesAc || null
      });

      // Actualizar datos universitarios si hay universidad seleccionada
      if (universityId && userId) {
        await updateUniversityDataMutation.mutateAsync({
          userId,
          universityId,
          programId,
          academicPeriod: academicPeriod || '',
          studyDuration: studyDuration || '',
          methodology: methodology || 'presencial',
          degreeTitle: degreeTitle || '',
          subscriptionType: subscriptionType || 'nuevo',
          applicationMethod: applicationMethod || 'online',
          severancePaymentUsed: severancePaymentUsed || false
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">Actualiza tu información personal y académica</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-6">
            
            {/* Información Personal */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Correo electrónico</label>
                    <input
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
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
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
                          <Input {...field} value={field.value || ''} />
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
                          <Input {...field} value={field.value || ''} />
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
                          <Input type="email" {...field} value={field.value || ''} />
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
                        <FormLabel>ICFES</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: AC202301234" value={field.value || ''} />
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
                  
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de sangre</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
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
                </div>
                
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
                          className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
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
              </CardContent>
            </Card>

            {/* Información de Dirección */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  Información de Dirección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Información Universitaria */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  Información Universitaria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="universityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Universidad y Programa</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="academicPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodo académico</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: 2024-1" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studyDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración de estudios</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: 8 semestres" value={field.value || ''} />
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
                            <SelectItem value="presencial_tic">Presencial Asistido por TIC's</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
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
                          <Input {...field} value={field.value || ''} />
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
                              <SelectValue placeholder="Selecciona el tipo" />
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
                              <SelectValue placeholder="Selecciona el método" />
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
                </div>

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
                          className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
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
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-4">
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
