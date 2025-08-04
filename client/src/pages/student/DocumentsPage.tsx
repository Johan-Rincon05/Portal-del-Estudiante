import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDocuments } from '@/hooks/use-documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Eye, 
  Download, 
  Trash2, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner'; // Cambiar a Sonner
import { StudentLayout } from '@/components/layouts/StudentLayout';
import { DocumentViewerModal } from '@/components/DocumentViewerModal';
import { UploadDocumentModal } from '@/components/UploadDocumentModal';
import { DocumentRejectionModal } from '@/components/DocumentRejectionModal';

const DocumentsPage = () => {
  const { user } = useAuth();
  const { documents, isLoading, uploadDocumentMutation, deleteDocumentMutation, refetch } = useDocuments(user?.id?.toString());
  
  // Logs de depuración
  console.log('[DEBUG] DocumentsPage - User:', user);
  console.log('[DEBUG] DocumentsPage - User ID:', user?.id);
  console.log('[DEBUG] DocumentsPage - Documents:', documents);
  console.log('[DEBUG] DocumentsPage - IsLoading:', isLoading);
  
  // Estados para modales
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectedDocument, setRejectedDocument] = useState<any>(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Función para obtener el badge de estado del documento
  const getStatusBadge = (status: string, rejectionReason?: string | null) => {
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

  // Filtrar documentos
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getDocumentTypeLabel(doc.type).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, searchTerm, statusFilter, typeFilter]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = documents.length;
    const aprobados = documents.filter(doc => doc.status === 'aprobado').length;
    const pendientes = documents.filter(doc => doc.status === 'pendiente').length;
    const rechazados = documents.filter(doc => doc.status === 'rechazado').length;
    
    return { total, aprobados, pendientes, rechazados };
  }, [documents]);

  // Manejar subida de documento
  const handleUploadDocument = async (data: { type: string; file: File; observations?: string }) => {
    if (!user?.id) return;
    
    uploadDocumentMutation.mutate({
      userId: user.id.toString(),
      type: data.type,
      file: data.file,
      observations: data.observations
    }, {
      onSuccess: () => {
        setShowUploadModal(false);
        refetch();
      }
    });
  };

  // Manejar eliminación de documento
  const handleDeleteDocument = (documentId: string) => {
    if (!documentId) {
      toast.error("ID de documento no válido");
      return;
    }
    deleteDocumentMutation.mutate(documentId, {
      onSuccess: () => {
        // Si el documento eliminado es el que está en el modal, ciérralo
        if (selectedDocument && selectedDocument.id?.toString() === documentId) {
          setShowViewerModal(false);
          setSelectedDocument(null);
        }
      }
    });
  };

  // Manejar visualización de documento
  const handleViewDocument = (document: any) => {
    if (!document) {
      toast.error("No se pudo cargar la información del documento");
      return;
    }
    setSelectedDocument(document);
    setShowViewerModal(true);
  };

  // Manejar visualización de documento rechazado
  const handleViewRejectedDocument = (document: any) => {
    if (!document) {
      toast.error("No se pudo cargar la información del documento");
      return;
    }
    setRejectedDocument(document);
    setShowRejectionModal(true);
  };

  // Manejar reenvío de documento
  const handleResubmitDocument = async (documentId: string, newFile: File) => {
    if (!user?.id) return;
    
    uploadDocumentMutation.mutate({
      userId: user.id.toString(),
      type: rejectedDocument?.type || '',
      file: newFile,
      observations: `Reenvío del documento ${documentId}`
    }, {
      onSuccess: () => {
        setShowRejectionModal(false);
        setRejectedDocument(null);
        refetch();
        toast.success('Documento reenviado exitosamente');
      }
    });
  };

  // Función para cerrar el modal del visor
  const handleCloseViewerModal = () => {
    setShowViewerModal(false);
    setSelectedDocument(null);
  };

  console.log('[DEBUG] DocumentsPage - Renderizando componente');
  console.log('[DEBUG] DocumentsPage - SelectedDocument:', selectedDocument);
  console.log('[DEBUG] DocumentsPage - ShowViewerModal:', showViewerModal);
  
  return (
    <StudentLayout>
      <div className="container w-full max-w-7xl mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Documentos</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona y sube tus documentos académicos y personales
              </p>
            </div>
            <Button 
              className="mt-3 sm:mt-0"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Aprobados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.aprobados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rechazados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rechazados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="cedula">Cédula</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="acta">Acta</SelectItem>
                    <SelectItem value="foto">Foto</SelectItem>
                    <SelectItem value="recibo">Recibo</SelectItem>
                    <SelectItem value="formulario">Formulario</SelectItem>
                    <SelectItem value="certificado">Certificado</SelectItem>
                    <SelectItem value="constancia">Constancia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de documentos */}
        <Card>
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <CardTitle className="text-lg">
              Documentos ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {document.name}
                            </h3>
                            {getStatusBadge(document.status, document.rejectionReason)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{getDocumentTypeLabel(document.type)}</span>
                            <span>•</span>
                            <span>
                              Subido el {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 'N/A'}
                            </span>
                            {document.rejectionReason && (
                              <>
                                <span>•</span>
                                <span className="text-red-600">Rechazado</span>
                              </>
                            )}
                          </div>
                          {document.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">
                              Motivo: {document.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {document.status === 'rechazado' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRejectedDocument(document)}
                            className="text-red-600 hover:text-red-500"
                          >
                            <AlertCircle className="h-4 w-4" />
                            Ver Detalles
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(document)}
                            className="text-primary-600 hover:text-primary-500"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id?.toString() || '')}
                          className="text-red-600 hover:text-red-500"
                          disabled={deleteDocumentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {documents.length === 0 ? 'No hay documentos' : 'No se encontraron documentos'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {documents.length === 0 
                    ? 'Comienza subiendo tu primer documento.'
                    : 'Intenta ajustar los filtros de búsqueda.'
                  }
                </p>
                {documents.length === 0 && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Primer Documento
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadDocument}
        isUploading={uploadDocumentMutation.isPending}
      />

      {selectedDocument && (
        <DocumentViewerModal
          isOpen={showViewerModal}
          onClose={handleCloseViewerModal}
          document={selectedDocument}
        />
      )}

      {rejectedDocument && (
        <DocumentRejectionModal
          isOpen={showRejectionModal}
          onClose={() => {
            setShowRejectionModal(false);
            setRejectedDocument(null);
          }}
          document={rejectedDocument}
          onResubmit={handleResubmitDocument}
        />
      )}
    </StudentLayout>
  );
};

export default DocumentsPage;
