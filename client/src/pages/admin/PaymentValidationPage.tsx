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
  CreditCard,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Payment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  paymentDate: string;
  validatedAt?: string;
  validatedBy?: string;
  rejectionReason?: string;
  observations?: string;
  quotaNumber?: number;
  totalQuotas?: number;
}

interface Quota {
  id: number;
  userId: number;
  userName: string;
  quotaNumber: number;
  totalQuotas: number;
  amount: number;
  dueDate: string;
  status: 'pendiente' | 'pagado' | 'vencido';
  paymentId?: number;
}

interface PaymentValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onValidate: (paymentId: number, status: 'aprobado' | 'rechazado', reason?: string) => Promise<void>;
  isLoading: boolean;
}

function PaymentValidationModal({ 
  isOpen, 
  onClose, 
  payment, 
  onValidate, 
  isLoading 
}: PaymentValidationModalProps) {
  const [status, setStatus] = useState<'aprobado' | 'rechazado'>('aprobado');
  const [reason, setReason] = useState('');
  const [observations, setObservations] = useState('');

  const handleSubmit = async () => {
    if (!payment) return;
    
    try {
      await onValidate(payment.id, status, status === 'rechazado' ? reason : undefined);
      onClose();
      setStatus('aprobado');
      setReason('');
      setObservations('');
    } catch (error) {
      console.error('Error validating payment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Validar Pago</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Pago */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Estudiante</Label>
                  <p className="text-sm text-gray-600">{payment.userName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{payment.userEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Monto</Label>
                  <p className="text-sm text-gray-600">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Método de Pago</Label>
                  <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Referencia</Label>
                  <p className="text-sm text-gray-600">{payment.reference}</p>
                </div>
                {payment.quotaNumber && (
                  <div>
                    <Label className="text-sm font-medium">Cuota</Label>
                    <p className="text-sm text-gray-600">
                      {payment.quotaNumber} de {payment.totalQuotas}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Fecha de Pago</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado Actual</Label>
                  <Badge className={getStatusBadge(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Comprobante */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comprobante de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Comprobante de pago</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.open(`/uploads/payments/${payment.reference}.pdf`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Comprobante
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
                            Aprobar Pago
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Rechazar Pago
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

export default function PaymentValidationPage() {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    paymentMethod: 'todos',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  const queryClient = useQueryClient();

  // Simular datos de pagos (reemplazar con API real)
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: 1,
        userId: 1,
        userName: 'Juan Pérez',
        userEmail: 'juan.perez@email.com',
        amount: 1500.00,
        currency: 'USD',
        paymentMethod: 'Transferencia Bancaria',
        reference: 'TRF-2024-001',
        status: 'pendiente',
        paymentDate: '2024-01-15T10:30:00Z',
        quotaNumber: 1,
        totalQuotas: 3
      },
      {
        id: 2,
        userId: 2,
        userName: 'María García',
        userEmail: 'maria.garcia@email.com',
        amount: 500.00,
        currency: 'USD',
        paymentMethod: 'Tarjeta de Crédito',
        reference: 'CC-2024-002',
        status: 'aprobado',
        paymentDate: '2024-01-14T15:20:00Z',
        validatedAt: '2024-01-15T09:00:00Z',
        validatedBy: 'Admin User',
        quotaNumber: 2,
        totalQuotas: 3
      },
      {
        id: 3,
        userId: 3,
        userName: 'Carlos López',
        userEmail: 'carlos.lopez@email.com',
        amount: 750.00,
        currency: 'USD',
        paymentMethod: 'PayPal',
        reference: 'PP-2024-003',
        status: 'rechazado',
        paymentDate: '2024-01-13T12:45:00Z',
        validatedAt: '2024-01-14T11:30:00Z',
        validatedBy: 'Admin User',
        rejectionReason: 'El monto no coincide con la cuota esperada'
      }
    ];

    const mockQuotas: Quota[] = [
      {
        id: 1,
        userId: 1,
        userName: 'Juan Pérez',
        quotaNumber: 1,
        totalQuotas: 3,
        amount: 1500.00,
        dueDate: '2024-01-15',
        status: 'pendiente'
      },
      {
        id: 2,
        userId: 1,
        userName: 'Juan Pérez',
        quotaNumber: 2,
        totalQuotas: 3,
        amount: 1500.00,
        dueDate: '2024-02-15',
        status: 'pendiente'
      },
      {
        id: 3,
        userId: 1,
        userName: 'Juan Pérez',
        quotaNumber: 3,
        totalQuotas: 3,
        amount: 1500.00,
        dueDate: '2024-03-15',
        status: 'pendiente'
      },
      {
        id: 4,
        userId: 2,
        userName: 'María García',
        quotaNumber: 1,
        totalQuotas: 3,
        amount: 500.00,
        dueDate: '2024-01-10',
        status: 'pagado',
        paymentId: 2
      }
    ];

    setPayments(mockPayments);
    setQuotas(mockQuotas);
    setFilteredPayments(mockPayments);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = payments;

    if (filters.search) {
      filtered = filtered.filter(payment => 
        payment.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.userEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.reference.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'todos') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    if (filters.paymentMethod !== 'todos') {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.paymentMethod);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) <= new Date(filters.dateTo)
      );
    }

    if (filters.amountMin) {
      filtered = filtered.filter(payment => 
        payment.amount >= parseFloat(filters.amountMin)
      );
    }

    if (filters.amountMax) {
      filtered = filtered.filter(payment => 
        payment.amount <= parseFloat(filters.amountMax)
      );
    }

    setFilteredPayments(filtered);
  }, [payments, filters]);

  const handleValidatePayment = async (
    paymentId: number, 
    status: 'aprobado' | 'rechazado', 
    reason?: string
  ) => {
    setIsValidating(true);
    try {
      // TODO: Implementar llamada a API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              status, 
              rejectionReason: reason,
              validatedAt: new Date().toISOString(),
              validatedBy: 'Current Admin'
            }
          : payment
      ));

      toast.success(
        status === 'aprobado' 
          ? 'Pago aprobado exitosamente' 
          : 'Pago rechazado exitosamente'
      );
    } catch (error) {
      toast.error('Error al validar el pago');
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
      pagado: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    totalPayments: payments.length,
    pendingPayments: payments.filter(p => p.status === 'pendiente').length,
    approvedPayments: payments.filter(p => p.status === 'aprobado').length,
    rejectedPayments: payments.filter(p => p.status === 'rechazado').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pendiente').reduce((sum, p) => sum + p.amount, 0)
  };

  const quotaStats = {
    totalQuotas: quotas.length,
    pendingQuotas: quotas.filter(q => q.status === 'pendiente').length,
    paidQuotas: quotas.filter(q => q.status === 'pagado').length,
    overdueQuotas: quotas.filter(q => q.status === 'vencido').length
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Validación de Pagos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona y valida los pagos de los estudiantes
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.approvedPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="quotas" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Cuotas
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reportes
            </TabsTrigger>
          </TabsList>

          {/* Tab de Pagos */}
          <TabsContent value="payments" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Nombre, email o referencia..."
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
                    <Label className="text-sm font-medium">Método de Pago</Label>
                    <Select 
                      value={filters.paymentMethod} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los métodos</SelectItem>
                        <SelectItem value="Transferencia Bancaria">Transferencia Bancaria</SelectItem>
                        <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Monto Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={filters.amountMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pagos */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Pagos ({filteredPayments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron pagos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {payment.userName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {payment.userEmail} • {payment.paymentMethod}
                              </p>
                              <p className="text-sm text-gray-600">
                                Referencia: {payment.reference}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                              </p>
                              {payment.validatedAt && (
                                <p className="text-xs text-gray-500">
                                  Validado el {new Date(payment.validatedAt).toLocaleDateString('es-ES')} por {payment.validatedBy}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {payment.currency} {payment.amount.toFixed(2)}
                              </p>
                              {payment.quotaNumber && (
                                <p className="text-sm text-gray-600">
                                  Cuota {payment.quotaNumber} de {payment.totalQuotas}
                                </p>
                              )}
                            </div>
                            
                            <Badge className={getStatusBadge(payment.status)}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/uploads/payments/${payment.reference}.pdf`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            
                            {payment.status === 'pendiente' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowValidationModal(true);
                                }}
                              >
                                Validar
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {payment.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-medium text-red-800">Motivo de Rechazo:</p>
                            <p className="text-sm text-red-700">{payment.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Cuotas */}
          <TabsContent value="quotas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Cuotas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotas.map((quota) => (
                    <div
                      key={quota.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {quota.userName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Cuota {quota.quotaNumber} de {quota.totalQuotas}
                            </p>
                            <p className="text-sm text-gray-600">
                              Vence: {new Date(quota.dueDate).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${quota.amount.toFixed(2)}
                            </p>
                          </div>
                          
                          <Badge className={getStatusBadge(quota.status)}>
                            {quota.status.charAt(0).toUpperCase() + quota.status.slice(1)}
                          </Badge>
                          
                          {quota.status === 'pendiente' && (
                            <Button size="sm" variant="outline">
                              Gestionar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Reportes */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Recaudado:</span>
                      <span className="font-medium">${stats.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagos Pendientes:</span>
                      <span className="font-medium">${stats.pendingAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Pagos:</span>
                      <span className="font-medium">{stats.totalPayments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado de Cuotas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Cuotas:</span>
                      <span className="font-medium">{quotaStats.totalQuotas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cuotas Pagadas:</span>
                      <span className="font-medium">{quotaStats.paidQuotas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cuotas Pendientes:</span>
                      <span className="font-medium">{quotaStats.pendingQuotas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cuotas Vencidas:</span>
                      <span className="font-medium">{quotaStats.overdueQuotas}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Acciones de Reporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Reporte de Pagos
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generar Gráficos
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Reporte de Cuotas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Validación */}
        <PaymentValidationModal
          isOpen={showValidationModal}
          onClose={() => {
            setShowValidationModal(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onValidate={handleValidatePayment}
          isLoading={isValidating}
        />
      </div>
    </AdminLayout>
  );
} 