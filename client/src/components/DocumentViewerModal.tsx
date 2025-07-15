import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  User, 
  Calendar,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner'; // Cambiar a Sonner
import { useAuth } from '@/hooks/use-auth';

// Interfaz para las props del componente
interface DocumentViewerModalProps {
  document: any;
  isOpen: boolean;
  onClose: () => void;
}

// Componente para visualizar documentos y aprobar/rechazar su validación
export function DocumentViewerModal({ document, isOpen, onClose }: DocumentViewerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [observations, setObservations] = useState('');
  // Obtener el usuario autenticado
  const { user } = useAuth();

  // Validar que el documento existe antes de renderizar
  if (!document) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Revisar Documento
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontró información del documento</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Función para obtener el tipo de documento en formato legible
  const getDocumentTypeLabel = (type: string) => {
    switch(type) {
      case 'cedula':
        return 'Cédula de Ciudadanía';
      case 'diploma':
        return 'Diploma de Bachiller';
      case 'acta':
        return 'Acta de Grado';
      case 'foto':
        return 'Foto';
      default:
        return type;
    }
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'aprobado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'rechazado':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Función para descargar el documento
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      // Aquí iría la lógica para descargar el documento
      // Por ahora solo simulamos la descarga
      const link = document.createElement('a');
      link.href = document.url || '#';
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Descarga iniciada");
    } catch (error) {
      toast.error("No se pudo descargar el documento");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para aprobar el documento
  const handleApprove = async () => {
    try {
      setIsLoading(true);
      // Aquí iría la lógica para aprobar el documento
      // Por ahora solo simulamos la aprobación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Documento aprobado exitosamente");
      onClose();
    } catch (error) {
      toast.error("No se pudo aprobar el documento");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para rechazar el documento
  const handleReject = async () => {
    if (!observations.trim()) {
      toast.error("Debes agregar observaciones para rechazar el documento");
      return;
    }

    try {
      setIsLoading(true);
      // Aquí iría la lógica para rechazar el documento
      // Por ahora solo simulamos el rechazo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Documento rechazado");
      onClose();
    } catch (error) {
      toast.error("No se pudo rechazar el documento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Revisar Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Información del Documento</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nombre:</span>
                    <span>{document.name || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tipo:</span>
                    <span>{getDocumentTypeLabel(document.type || '')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Estado:</span>
                    {getStatusBadge(document.status || 'pendiente')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fecha de subida:</span>
                    <span>{document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString('es-ES') : 'No disponible'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Información del Estudiante</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nombre:</span>
                    <span>{document.student?.fullName || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{document.student?.email || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Documento:</span>
                    <span>{document.student?.documentNumber || 'No disponible'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista previa del documento */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Vista Previa</h3>
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                <div className="text-center w-full">
                  {/* Detectar el tipo de archivo para mostrar la vista previa adecuada */}
                  {(() => {
                    const ext = document.name?.split('.').pop()?.toLowerCase();
                    const url = document.url;
                    // Si es PDF, mostrar en un iframe
                    if (ext === 'pdf' && url) {
                      return (
                        <iframe
                          src={url}
                          title="Vista previa PDF"
                          className="w-full h-72 border rounded"
                          style={{ minHeight: 300 }}
                        />
                      );
                    }
                    // Si es imagen, mostrar con <img>
                    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext) && url) {
                      return (
                        <img
                          src={url}
                          alt="Vista previa del documento"
                          className="max-h-72 mx-auto rounded shadow"
                          style={{ maxWidth: '100%', minHeight: 100 }}
                        />
                      );
                    }
                    // Si no es compatible, mostrar el ícono y mensaje
                    return (
                      <>
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Vista previa no disponible para este tipo de archivo
                        </p>
                      </>
                    );
                  })()}
                  {/* Botón de descarga siempre disponible */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones y acciones solo para admin/superuser y si el documento está pendiente */}
          {(user?.role === 'admin' || user?.role === 'superuser') && document.status === 'pendiente' && (
            <>
              {/* Observaciones */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Observaciones (Opcional)</h3>
                <Textarea
                  placeholder="Agrega observaciones sobre el documento..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Las observaciones son obligatorias al rechazar un documento
                </p>
              </div>
              {/* Acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isLoading}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Rechazar
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Aprobar
                </Button>
              </div>
            </>
          )}

          {/* Para estudiantes o documentos no pendientes, solo mostrar botón cancelar y descargar */}
          {(!(user?.role === 'admin' || user?.role === 'superuser') || document.status !== 'pendiente') && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 