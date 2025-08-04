import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Check, 
  X, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  User,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Document {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  observations?: string;
}

interface DocumentValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onValidate: (documentId: number, status: 'aprobado' | 'rechazado', reason?: string) => Promise<void>;
  isLoading: boolean;
}

function DocumentValidationModal({ 
  isOpen, 
  onClose, 
  document, 
  onValidate, 
  isLoading 
}: DocumentValidationModalProps) {
  const [status, setStatus] = useState<'aprobado' | 'rechazado'>('aprobado');
  const [reason, setReason] = useState('');
  const [observations, setObservations] = useState('');

  const handleSubmit = async () => {
    if (!document) return;
    
    try {
      await onValidate(document.id, status, status === 'rechazado' ? reason : undefined);
      onClose();
      setStatus('aprobado');
      setReason('');
      setObservations('');
    } catch (error) {
      console.error('Error validating document:', error);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'dni': 'DNI',
      'certificado_estudios': 'Certificado de Estudios',
      'comprobante_pago': 'Comprobante de Pago',
      'foto_carnet': 'Foto Carnet',
      'certificado_medico': 'Certificado Médico'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Validar Documento</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Documento */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Estudiante</Label>
                  <p className="text-sm text-gray-600">{document.userName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{document.userEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo de Documento</Label>
                  <p className="text-sm text-gray-600">{getDocumentTypeLabel(document.type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Archivo</Label>
                  <p className="text-sm text-gray-600">{document.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Subida</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(document.uploadedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado Actual</Label>
                  <Badge className={getStatusBadge(document.status)}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vista Previa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{document.fileName}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Documento
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de Validación */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decisión de Validación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <Select value={status} onValueChange={(value: 'aprobado' | 'rechazado') => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aprobado">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Aprobar
                        </div>
                      </SelectItem>
                      <SelectItem value="rechazado">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          Rechazar
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === 'rechazado' && (
                  <div>
                    <Label className="text-sm font-medium">Motivo de Rechazo *</Label>
                    <Textarea
                      placeholder="Especifica el motivo del rechazo..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Observaciones (Opcional)</Label>
                  <Textarea
                    placeholder="Observaciones adicionales..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {status === 'rechazado' && !reason && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Debes especificar un motivo de rechazo.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || (status === 'rechazado' && !reason)}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </div>
                    ) : (
                      <>
                        {status === 'aprobado' ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Aprobar Documento
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Rechazar Documento
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentValidationPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    type: 'todos',
    dateFrom: '',
    dateTo: ''
  });

  const queryClient = useQueryClient();

  // Simular datos de documentos (reemplazar con API real)
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: 1,
        userId: 1,
        userName: 'Juan Pérez',
        userEmail: 'juan.perez@email.com',
        type: 'dni',
        fileName: 'dni_juan_perez.pdf',
        fileUrl: '/uploads/dni_juan_perez.pdf',
        status: 'pendiente',
        uploadedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        userId: 2,
        userName: 'María García',
        userEmail: 'maria.garcia@email.com',
        type: 'certificado_estudios',
        fileName: 'certificado_maria.pdf',
        fileUrl: '/uploads/certificado_maria.pdf',
        status: 'aprobado',
        uploadedAt: '2024-01-14T15:20:00Z',
        reviewedAt: '2024-01-15T09:00:00Z',
        reviewedBy: 'Admin User'
      },
      {
        id: 3,
        userId: 3,
        userName: 'Carlos López',
        userEmail: 'carlos.lopez@email.com',
        type: 'comprobante_pago',
        fileName: 'pago_carlos.pdf',
        fileUrl: '/uploads/pago_carlos.pdf',
        status: 'rechazado',
        uploadedAt: '2024-01-13T12:45:00Z',
        reviewedAt: '2024-01-14T11:30:00Z',
        reviewedBy: 'Admin User',
        rejectionReason: 'El comprobante no muestra claramente el monto pagado'
      }
    ];
    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = documents;

    if (filters.search) {
      filtered = filtered.filter(doc => 
        doc.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.userEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'todos') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    if (filters.type !== 'todos') {
      filtered = filtered.filter(doc => doc.type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(doc => 
        new Date(doc.uploadedAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(doc => 
        new Date(doc.uploadedAt) <= new Date(filters.dateTo)
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, filters]);

  const handleValidateDocument = async (
    documentId: number, 
    status: 'aprobado' | 'rechazado', 
    reason?: string
  ) => {
    setIsValidating(true);
    try {
      // TODO: Implementar llamada a API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status, 
              rejectionReason: reason,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Current Admin'
            }
          : doc
      ));

      toast.success(
        status === 'aprobado' 
          ? 'Documento aprobado exitosamente' 
          : 'Documento rechazado exitosamente'
      );
    } catch (error) {
      toast.error('Error al validar el documento');
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'dni': 'DNI',
      'certificado_estudios': 'Certificado de Estudios',
      'comprobante_pago': 'Comprobante de Pago',
      'foto_carnet': 'Foto Carnet',
      'certificado_medico': 'Certificado Médico'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: documents.length,
    pendientes: documents.filter(d => d.status === 'pendiente').length,
    aprobados: documents.filter(d => d.status === 'aprobado').length,
    rechazados: documents.filter(d => d.status === 'rechazado').length
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Validación de Documentos</h1>
          <p className="text-gray-600 mt-2">
            Revisa y valida los documentos enviados por los estudiantes
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.aprobados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rechazados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros Avanzados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label className="text-sm font-medium">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre, email o archivo..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Tipo de Documento</Label>
                <Select 
                  value={filters.type} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="dni">DNI</SelectItem>
                    <SelectItem value="certificado_estudios">Certificado de Estudios</SelectItem>
                    <SelectItem value="comprobante_pago">Comprobante de Pago</SelectItem>
                    <SelectItem value="foto_carnet">Foto Carnet</SelectItem>
                    <SelectItem value="certificado_medico">Certificado Médico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Desde</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Hasta</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>
              Documentos ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron documentos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getDocumentTypeLabel(document.type)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {document.userName} • {document.userEmail}
                          </p>
                          <p className="text-xs text-gray-500">
                            Subido el {new Date(document.uploadedAt).toLocaleDateString('es-ES')}
                          </p>
                          {document.reviewedAt && (
                            <p className="text-xs text-gray-500">
                              Revisado el {new Date(document.reviewedAt).toLocaleDateString('es-ES')} por {document.reviewedBy}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusBadge(document.status)}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(document.fileUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        
                        {document.status === 'pendiente' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(document);
                              setShowValidationModal(true);
                            }}
                          >
                            Validar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {document.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm font-medium text-red-800">Motivo de Rechazo:</p>
                        <p className="text-sm text-red-700">{document.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Validación */}
        <DocumentValidationModal
          isOpen={showValidationModal}
          onClose={() => {
            setShowValidationModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onValidate={handleValidateDocument}
          isLoading={isValidating}
        />
      </div>
    </AdminLayout>
  );
} 