import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  XCircle, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Calendar,
  User,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal';
import { toast } from 'sonner';

interface DocumentRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    type: string;
    status: string;
    rejectionReason?: string;
    reviewedAt?: string;
    reviewedBy?: number;
    uploadedAt: string;
  };
  onResubmit?: (documentId: string, newFile: File) => Promise<void>;
}

export function DocumentRejectionModal({ 
  isOpen, 
  onClose, 
  document,
  onResubmit 
}: DocumentRejectionModalProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

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
      case 'recibo':
        return 'Recibo de Pago';
      case 'formulario':
        return 'Formulario';
      case 'certificado':
        return 'Certificado';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'rechazado':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Rechazado</Badge>;
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
      case 'aprobado':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Aprobado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleResubmit = async (file: File) => {
    if (!onResubmit) return;

    setIsResubmitting(true);
    try {
      await onResubmit(document.id, file);
      toast.success('Documento reenviado exitosamente');
      setShowUploadModal(false);
      onClose();
    } catch (error) {
      console.error('Error al reenviar documento:', error);
      toast.error('Error al reenviar el documento. Intenta nuevamente.');
    } finally {
      setIsResubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Documento Rechazado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del documento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {document.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{getDocumentTypeLabel(document.type)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  {getStatusBadge(document.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subido:</span>
                  <span className="text-sm">{formatDate(document.uploadedAt)}</span>
                </div>
                {document.reviewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revisado:</span>
                    <span className="text-sm">{formatDate(document.reviewedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motivo de rechazo */}
            {document.rejectionReason && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="space-y-2">
                    <p className="font-medium">Motivo del rechazo:</p>
                    <p className="text-sm">{document.rejectionReason}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Instrucciones para reenvío */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                  <Upload className="h-5 w-5" />
                  ¿Cómo corregir el documento?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-blue-800">
                <div className="space-y-2 text-sm">
                  <p>Para corregir tu documento:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Revisa el motivo del rechazo</li>
                    <li>Corrige el documento según las observaciones</li>
                    <li>Sube la versión corregida</li>
                    <li>Espera la nueva validación</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="w-full"
                size="lg"
              >
                <Upload className="mr-2 h-4 w-4" />
                Reenviar Documento Corregido
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>

            {/* Información adicional */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>¿Necesitas ayuda?</p>
              <p>Contacta al soporte técnico si tienes dudas sobre los requisitos</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de subida de documento corregido */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        documentType={document.type}
        onUpload={handleResubmit}
        isResubmit={true}
        isLoading={isResubmitting}
      />
    </>
  );
} 