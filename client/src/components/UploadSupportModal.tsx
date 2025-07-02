import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  installmentId: number;
  installmentNumber: string;
  onSuccess: () => void;
}

export default function UploadSupportModal({
  isOpen,
  onClose,
  installmentId,
  installmentNumber,
  onSuccess
}: UploadSupportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [observations, setObservations] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Función para manejar la selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de archivo (PDF, imágenes, etc.)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Solo se permiten archivos PDF, JPEG, PNG o JPG');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  // Función para manejar la subida del soporte
  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('support', file);
      formData.append('observations', observations);
      
      // Log de depuración
      console.log('[DEBUG] Frontend - Archivo a enviar:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        installmentId,
        observations
      });
      
      // Verificar que el FormData tenga el archivo
      for (let [key, value] of formData.entries()) {
        console.log('[DEBUG] FormData entry:', key, value);
      }
      
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/payments/installments/${installmentId}/support`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el soporte');
      }

      const result = await response.json();
      
      // Mostrar mensaje de éxito
      toast({
        title: "Soporte subido exitosamente",
        description: "Tu soporte de pago ha sido enviado para revisión",
        variant: "default",
      });

      // Limpiar formulario y cerrar modal
      setFile(null);
      setObservations('');
      setError('');
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error al subir soporte:', error);
      setError(error instanceof Error ? error.message : 'Error al subir el soporte');
    } finally {
      setIsUploading(false);
    }
  };

  // Función para cerrar modal y limpiar estado
  const handleClose = () => {
    setFile(null);
    setObservations('');
    setError('');
    onClose();
  };

  // Función para eliminar archivo seleccionado
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Soporte de Pago
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la cuota */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Cuota:</strong> {installmentNumber}
            </p>
          </div>

          {/* Selector de archivo */}
          <div className="space-y-2">
            <Label htmlFor="file">Archivo de soporte *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!file ? (
                <div 
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPEG, PNG (máximo 5MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Campo de observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones (opcional)</Label>
            <Textarea
              id="observations"
              placeholder="Agrega cualquier observación relevante sobre este pago..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {observations.length}/500 caracteres
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Información adicional */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Tu soporte será revisado por el personal administrativo. 
              Recibirás una notificación cuando sea aprobado o rechazado.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Subiendo...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Subir Soporte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 