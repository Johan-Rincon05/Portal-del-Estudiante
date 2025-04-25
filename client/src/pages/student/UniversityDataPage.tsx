import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useUniversityData } from '@/hooks/use-university-data';
import { universityDataFormSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { UniversityProgramSelect } from '@/components/UniversityProgramSelect';
import { Switch } from '@/components/ui/switch';

type UniversityDataFormValues = z.infer<typeof universityDataFormSchema>;

const UniversityDataPage = () => {
  const { user } = useAuth();
  const { data: universityData, isLoading } = useUniversityData(user?.id);
  const { mutate: updateUniversityData, isPending } = useUpdateUniversityData();

  const form = useForm<UniversityDataFormValues>({
    resolver: zodResolver(universityDataFormSchema),
    defaultValues: {
      universityId: undefined,
      programId: undefined,
      academicPeriod: '',
      studyDuration: '',
      methodology: undefined,
      degreeTitle: '',
      subscriptionType: undefined,
      applicationMethod: undefined,
      severancePaymentUsed: false,
    }
  });

  useEffect(() => {
    if (universityData) {
      form.reset(universityData);
    }
  }, [universityData, form]);

  const handleSubmit = (values: UniversityDataFormValues) => {
    if (user?.id) {
      updateUniversityData({
        ...values,
        userId: user.id
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
        <h2 className="text-lg font-semibold text-gray-900">Información Universitaria</h2>
        <p className="text-sm text-gray-500">Registra o actualiza tus datos universitarios</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <UniversityProgramSelect form={form} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="academicPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Periodo Académico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 2024-1" {...field} />
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
                  <FormLabel>Duración de Estudios</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 4 semestres" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la metodología" />
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
                  <FormLabel>Título a Obtener</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Técnico en..." {...field} />
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
                  <FormLabel>Tipo de Inscripción</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormLabel>Método de Aplicación</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el método" />
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Uso de Cesantías</FormLabel>
                    <div className="text-sm text-gray-500">
                      ¿Utilizarás cesantías para el pago?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
              disabled={isPending}
            >
              {isPending ? (
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

export default UniversityDataPage; 