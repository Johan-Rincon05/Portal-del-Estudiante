import { useState } from 'react';
import { useAllRequests } from '@/hooks/use-requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  User
} from 'lucide-react';
import { CarteraLayout } from '@/components/layouts/CarteraLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function FinancialRequestsPage() {
  // Obtener solo solicitudes financieras
  const { allRequests, isLoading, respondToRequestMutation } = useAllRequests({ requestType: 'financiera' });
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'en_proceso' | 'completada' | 'rechazada'>('en_proceso');
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    dateFrom: '',
    dateTo: ''
  });

  // Aplicar filtros
  const filteredRequests = allRequests?.filter(request => {
    const matchesSearch = !filters.search || 
      request.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.message.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.userName?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'todos' || request.status === filters.status;
    
    const createdAt = new Date(request.createdAt);
    const matchesDateFrom = !filters.dateFrom || createdAt >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || createdAt <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendiente':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'en_proceso':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            En Proceso
          </Badge>
        );
      case 'completada':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completada
          </Badge>
        );
      case 'rechazada':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rechazada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Función para manejar la respuesta a una solicitud
  const handleRespond = async () => {
    if (!selectedRequest || !response) return;

    try {
      await respondToRequestMutation.mutateAsync({
        id: selectedRequest.id,
        data: {
          response,
          status
        }
      });

      setShowResponseModal(false);
      setSelectedRequest(null);
      setResponse('');
      setStatus('en_proceso');
    } catch (error) {
      console.error('Error al responder solicitud:', error);
    }
  };

  return (
    <CarteraLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes Financieras</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes financieras de los estudiantes
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar solicitudes..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Estado</Label>
                <Select 
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Solicitudes ({filteredRequests?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
              </div>
            ) : filteredRequests?.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron solicitudes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests?.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {request.userName || 'Usuario'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.userEmail || 'email@ejemplo.com'}
                          </p>
                          <p className="text-sm font-medium text-gray-900 mt-2">
                            {request.subject}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(request.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(request.status)}
                        
                        {request.status === 'pendiente' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowResponseModal(true);
                            }}
                          >
                            Responder
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {request.response && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">Respuesta:</p>
                        <p className="text-sm text-gray-600 mt-1">{request.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Respuesta */}
        <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responder Solicitud</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label>Solicitud Original</Label>
                <p className="text-sm font-medium mt-1">{selectedRequest?.subject}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest?.message}</p>
              </div>

              <div>
                <Label>Estado</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Respuesta</Label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  className="min-h-[100px]"
                />
              </div>

              {status === 'rechazada' && !response && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Debes proporcionar un motivo para el rechazo.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedRequest(null);
                  setResponse('');
                  setStatus('en_proceso');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRespond}
                disabled={!response || (status === 'rechazada' && !response)}
              >
                Enviar Respuesta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CarteraLayout>
  );
}