import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Upload,
  Loader2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAdminDocuments } from '@/hooks/use-documents';
import { DocumentViewerModal } from '@/components/DocumentViewerModal';

export default function DocumentValidationPage() {
  const { data: documents = [], isLoading, refetch } = useAdminDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar documentos
  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.student?.documentNumber?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'todos' || doc.status === statusFilter;
    const matchesType = typeFilter === 'todos' || doc.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calcular estadísticas
  const stats = {
    total: documents.length,
    pendientes: documents.filter((doc: any) => doc.status === 'pendiente').length,
    aprobados: documents.filter((doc: any) => doc.status === 'aprobado').length,
    rechazados: documents.filter((doc: any) => doc.status === 'rechazado').length,
  };

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

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
    // Refetch para actualizar la lista después de aprobar/rechazar
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando documentos...</span>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container w-full max-w-7xl mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Validación de Documentos</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Revisa y valida los documentos enviados por los estudiantes
              </p>
            </div>
            <Button className="mt-3 sm:mt-0">
              <Upload className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.pendientes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.aprobados}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.rechazados}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <label htmlFor="search-documents" className="sr-only">Buscar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="search-documents"
                      name="search-documents"
                      type="text"
                      placeholder="Buscar documentos por estudiante o tipo"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <div className="w-full md:w-48">
                    <label htmlFor="status" className="sr-only">Estado</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="aprobado">Aprobado</SelectItem>
                        <SelectItem value="rechazado">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <label htmlFor="type" className="sr-only">Tipo</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los tipos</SelectItem>
                        <SelectItem value="cedula">Cédula</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="acta">Acta</SelectItem>
                        <SelectItem value="foto">Foto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button>
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Pendientes de Validación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Esta funcionalidad estará disponible próximamente. Aquí podrás revisar y validar todos los documentos enviados por los estudiantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Vista Previa
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
            <CardDescription>
              Lista de documentos enviados por los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron documentos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((document: any) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{document.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {document.student?.fullName || 'Estudiante no encontrado'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {getDocumentTypeLabel(document.type)}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(document.uploadedAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(document.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de vista previa */}
        {selectedDocument && (
          <DocumentViewerModal
            document={selectedDocument}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </AdminLayout>
  );
} 