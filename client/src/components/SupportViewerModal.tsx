import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface SupportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  installmentNumber: string;
}

export function SupportViewerModal({ isOpen, onClose, filename, installmentNumber }: SupportViewerModalProps) {
  const { user } = useAuth();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la URL del soporte
  const fetchSupportUrl = async () => {
    if (!filename) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir la URL para iframe con token como parámetro
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/payments/support-iframe/${filename}?token=${encodeURIComponent(token)}`;
      setDocumentUrl(url);
    } catch (err) {
      setError('No se pudo cargar el soporte');
      console.error('Error fetching support URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para descargar el soporte
  const handleDownload = async () => {
    if (!filename) return;
    
    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/payments/support/${filename}?token=${encodeURIComponent(token)}`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError('No se pudo descargar el soporte');
      console.error('Error downloading support:', err);
    }
  };

  // Cargar soporte cuando se abre el modal
  useEffect(() => {
    if (isOpen && filename) {
      fetchSupportUrl();
    } else {
      setDocumentUrl(null);
      setError(null);
    }
  }, [isOpen, filename]);

  if (!filename) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[98vh] w-[95vw] overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Visualizar Soporte de Pago
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden px-6 pb-6">
          {/* Información del soporte */}
          <div className="flex-shrink-0 p-4 bg-gray-50 rounded-lg mb-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base">{filename}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Cuota:</span> #{installmentNumber}</p>
                  <p><span className="font-medium">Tipo:</span> Soporte de Pago</p>
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Visualizador del soporte */}
          <div className="flex-1 min-h-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-base text-gray-600 font-medium">Cargando soporte...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-base text-gray-600 mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchSupportUrl}
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : documentUrl ? (
              <iframe
                src={documentUrl}
                className="w-full h-full border-0"
                title={filename}
                style={{ 
                  minHeight: '700px',
                  backgroundColor: '#f8fafc'
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-base text-gray-600">No se pudo cargar el soporte</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 