import { useEffect, useState } from 'react';
import { useUniversities, usePrograms } from '@/hooks/use-universities';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const universityProgramSchema = z.object({
  universityId: z.number().optional(),
  programId: z.number().optional(),
});

type UniversityProgramFormValues = z.infer<typeof universityProgramSchema>;

interface UniversityProgramSelectProps {
  form: UseFormReturn<UniversityProgramFormValues>;
  onUniversityChange?: (universityId: number) => void;
  onProgramChange?: (programId: number) => void;
}

export function UniversityProgramSelect({
  form,
  onUniversityChange,
  onProgramChange
}: UniversityProgramSelectProps) {
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | undefined>(
    form.getValues('universityId')
  );
  
  const { data: universities, isLoading: isLoadingUniversities } = useUniversities();
  const { data: programs, isLoading: isLoadingPrograms } = usePrograms(selectedUniversityId);

  useEffect(() => {
    const universityId = form.getValues('universityId');
    if (universityId && universityId !== selectedUniversityId) {
      setSelectedUniversityId(universityId);
    }
  }, [form, selectedUniversityId]);

  useEffect(() => {
    if (selectedUniversityId) {
      onUniversityChange?.(selectedUniversityId);
    }
  }, [selectedUniversityId, onUniversityChange]);

  if (isLoadingUniversities) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="universityId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Universidad</FormLabel>
            <Select
              onValueChange={(value) => {
                const universityId = parseInt(value);
                if (!isNaN(universityId)) {
                  field.onChange(universityId);
                  setSelectedUniversityId(universityId);
                  form.setValue('programId', undefined);
                }
              }}
              value={field.value?.toString() ?? undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una universidad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {universities?.map((university) => (
                  <SelectItem key={university.id} value={university.id.toString()}>
                    {university.name}
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
        name="programId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Programa</FormLabel>
            <Select
              onValueChange={(value) => {
                const programId = parseInt(value);
                if (!isNaN(programId)) {
                  field.onChange(programId);
                  onProgramChange?.(programId);
                }
              }}
              value={field.value?.toString() ?? undefined}
              disabled={!selectedUniversityId || isLoadingPrograms}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingPrograms ? "Cargando programas..." : "Selecciona un programa"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {programs?.map((program) => (
                  <SelectItem key={program.id} value={program.id.toString()}>
                    {program.name} {program.isConvention ? '(en convenio)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
} 