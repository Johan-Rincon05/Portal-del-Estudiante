import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, X, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/query-client';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: number;
    name: string;
    type: string;
    status: string;
    rejectionReason?: string | null;
    uploadedAt?: string;
    path: string;
  } | null;
}

export function DocumentViewerModal({ isOpen, onClose, document }: DocumentViewerModalProps) {
  const { user } = useAuth();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la URL del documento
  const fetchDocumentUrl = async () => {
    if (!document) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<{ url: string }>(`/api/documents/${document.id}/url`);
      setDocumentUrl(response.url);
    } catch (err) {
      setError('No se pudo cargar el documento');
      console.error('Error fetching document URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para descargar el documento
  const handleDownload = async () => {
    if (!document) return;
    
    try {
      const response = await apiRequest<{ url: string }>(`/api/documents/${document.id}/download`);
      const a = window.document.createElement('a');
      a.href = response.url;
      a.download = `${document.type}_${document.name}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } catch (err) {
      setError('No se pudo descargar el documento');
      console.error('Error downloading document:', err);
    }
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'aprobado':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'rechazado':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      case 'pendiente':
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  // Función para obtener el tipo de documento en español
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

  // Función para obtener la URL del documento para iframe
  const getIframeUrl = () => {
    if (!document) return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/documents/${document.id}/iframe?token=${encodeURIComponent(token)}`;
  };

  // Cargar documento cuando se abre el modal
  useEffect(() => {
    if (isOpen && document) {
      fetchDocumentUrl();
    } else {
      setDocumentUrl(null);
      setError(null);
    }
  }, [isOpen, document]);

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl w-[98vw] max-h-[98vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl border border-gray-200 overflow-hidden",
          )}
        >
          {/* Cabecera del modal mejorada */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-100 bg-white">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <FileText className="h-7 w-7 text-primary" />
              Visualizar Documento
            </DialogTitle>
          </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden px-6 pb-6 pt-2 bg-gray-50">
          {/* Información del documento */}
          <div className="flex-shrink-0 p-5 bg-white rounded-xl mb-5 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg truncate">{document.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tipo:</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200 text-xs">{getDocumentTypeLabel(document.type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Estado:</span>
                    {getStatusBadge(document.status)}
                  </div>
                  {document.uploadedAt && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Subido:</span>
                      <span className="text-xs text-gray-500">{new Date(document.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center items-end gap-2">
                <Button 
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Descargar
                </Button>
                {document.status === 'rechazado' && document.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 w-full">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800 mb-1">Motivo del rechazo:</p>
                      <p className="text-sm text-red-700">{document.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Separador visual */}
          <Separator className="flex-shrink-0 mb-4" />

          {/* Visualizador del documento */}
          <div className="flex-1 min-h-0 bg-white rounded-xl overflow-hidden border border-gray-200 shadow flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-base text-gray-600 font-medium">Cargando documento...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-base text-gray-600 mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchDocumentUrl}
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : document ? (
              <iframe
                src={getIframeUrl() || ''}
                className="w-full h-[75vh] min-h-[600px] border-0 rounded-xl bg-white"
                title={document.name}
                style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.04)' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-base text-gray-600">No se pudo cargar el documento</p>
                </div>
              </div>
            )}
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
} 