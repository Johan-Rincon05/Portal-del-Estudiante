import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const uploadDocumentSchema = z.object({
  type: z.string().min(1, "Tipo de documento es requerido"),
  file: z.instanceof(File, { message: "Archivo es requerido" }),
  observations: z.string().optional()
});

type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: UploadDocumentFormValues | File) => Promise<void>;
  isUploading?: boolean;
  documentType?: string;
  isResubmit?: boolean;
  isLoading?: boolean;
}

export function UploadDocumentModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  isUploading = false,
  documentType,
  isResubmit = false,
  isLoading = false
}: UploadDocumentModalProps) {
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<UploadDocumentFormValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      type: documentType || '',
      observations: ''
    }
  });

  const handleSubmit = async (values: UploadDocumentFormValues) => {
    if (isResubmit) {
      // Para reenvío, solo pasamos el archivo
      await onUpload(values.file);
    } else {
      // Para subida normal, pasamos todos los datos
      await onUpload(values);
    }
    form.reset();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      form.setValue('file', file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue('file', e.target.files[0]);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'cedula': 'Cédula de Identidad',
      'diploma': 'Diploma',
      'acta': 'Acta',
      'foto': 'Foto',
      'recibo': 'Recibo',
      'formulario': 'Formulario',
      'certificado': 'Certificado',
      'constancia': 'Constancia'
    };
    return types[type] || type;
  };

  const selectedFile = form.watch('file');
  const selectedType = form.watch('type');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {isResubmit ? 'Reenviar Documento' : 'Subir Nuevo Documento'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isUploading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Tipo de documento - solo mostrar si no es reenvío */}
            {!isResubmit && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo de documento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cedula">Cédula de Identidad</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="acta">Acta</SelectItem>
                        <SelectItem value="foto">Foto</SelectItem>
                        <SelectItem value="recibo">Recibo</SelectItem>
                        <SelectItem value="formulario">Formulario</SelectItem>
                        <SelectItem value="certificado">Certificado</SelectItem>
                        <SelectItem value="constancia">Constancia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Área de subida de archivo */}
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                        dragActive 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => !selectedFile && document.querySelector('input[type="file"]')?.click()}
                    >
                      {selectedFile ? (
                        <div className="space-y-2">
                          <FileText className="mx-auto h-8 w-8 text-primary-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.setValue('file', undefined as any)}
                            disabled={isUploading}
                          >
                            Cambiar archivo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-primary-600 hover:text-primary-500">
                                Haz clic para subir
                              </span>{' '}
                              o arrastra y suelta
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF hasta 10MB
                            </p>
                          </div>
                          <Input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.querySelector('input[type="file"]')?.click()}
                            disabled={isUploading}
                          >
                            Seleccionar archivo
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observaciones - solo mostrar si no es reenvío */}
            {!isResubmit && (
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agrega cualquier comentario o información adicional sobre este documento..."
                        className="resize-none"
                        rows={3}
                        disabled={isUploading || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Información del tipo seleccionado */}
            {selectedType && !isResubmit && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  {getDocumentTypeLabel(selectedType)}
                </p>
                <p className="text-xs text-blue-700">
                  Este documento será revisado por un administrador antes de ser aprobado.
                </p>
              </div>
            )}

            {/* Información para reenvío */}
            {isResubmit && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm font-medium text-orange-800 mb-1">
                  Reenviando documento corregido
                </p>
                <p className="text-xs text-orange-700">
                  Sube la versión corregida del documento. Será revisado nuevamente por un administrador.
                </p>
              </div>
            )}

            <Separator />

            {/* Botones de acción */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading || isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading || isLoading || !selectedFile || (!selectedType && !isResubmit)}
              >
                {isUploading || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isResubmit ? 'Reenviando...' : 'Subiendo...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {isResubmit ? 'Reenviar Documento' : 'Subir Documento'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 