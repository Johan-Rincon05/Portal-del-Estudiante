/**
 * Página de Pagos para Estudiantes
 * Muestra el historial de pagos y las cuotas pendientes del estudiante
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { usePayments, useInstallments, usePaymentSummary, type PaymentSummary } from '@/hooks/use-payments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreditCard, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react';
import { StudentLayout } from '@/components/layouts/StudentLayout';
import { useToast } from '@/hooks/use-toast';
import UploadSupportModal from '@/components/UploadSupportModal';
import { SupportViewerModal } from '@/components/SupportViewerModal';

/**
 * Componente principal de la página de pagos
 */
export default function PaymentsPage() {
  const { data: payments, isLoading: isLoadingPayments, error: paymentsError } = usePayments();
  const { data: installments, isLoading: isLoadingInstallments, error: installmentsError } = useInstallments();
  const { data: summary, isLoading: isLoadingSummary } = usePaymentSummary();
  const { toast } = useToast();
  
  // Estados para el modal de subida de soporte
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  
  // Estados para el modal de visualización de documentos
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{filename: string, installmentNumber: string} | null>(null);
  
  // Verificación de tipo para summary
  const typedSummary = summary as PaymentSummary | undefined;

  // Log de depuración para verificar los datos
  console.log('PaymentsPage - Datos cargados:', {
    payments: payments?.length || 0,
    installments: installments?.length || 0,
    summary: typedSummary,
    isLoadingPayments,
    isLoadingInstallments,
    isLoadingSummary
  });

  /**
   * Verifica si hay errores de autenticación
   */
  const hasAuthError = (error: any) => {
    return error instanceof Error && (
      error.message.includes('401') || 
      error.message.includes('Token') || 
      error.message.includes('autenticación')
    );
  };

  /**
   * Formatea el monto como moneda
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Formatea la fecha
   */
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha no válida';
    }
  };

  /**
   * Obtiene el estado de una cuota
   */
  const getInstallmentStatus = (installment: any) => {
    if (installment.status === 'pagada') {
      return { label: 'Pagada', variant: 'default' as const, icon: CheckCircle };
    }
    
    if (installment.dueDate && new Date(installment.dueDate) < new Date()) {
      return { label: 'Vencida', variant: 'destructive' as const, icon: AlertCircle };
    }
    
    return { label: 'Pendiente', variant: 'secondary' as const, icon: Clock };
  };

  /**
   * Obtiene el ícono del método de pago
   */
  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'tarjeta':
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'efectivo':
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'transferencia':
      case 'transfer':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Función para abrir el modal de subida de soporte
  const handleOpenUploadModal = (installment: any) => {
    setSelectedInstallment(installment);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInstallment(null);
  };

  // Función para manejar el éxito de la subida
  const handleUploadSuccess = () => {
    // Refrescar los datos de cuotas
    window.location.reload();
  };

  // Función para abrir el modal de visualización
  const handleOpenViewer = (support: string, installmentNumber: string) => {
    // Extraer el nombre del archivo de la ruta
    const filename = support.split('/').pop() || '';
    setSelectedDocument({ filename, installmentNumber });
    setIsViewerOpen(true);
  };

  // Función para cerrar el modal de visualización
  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoadingPayments || isLoadingInstallments || isLoadingSummary) {
    return (
      <StudentLayout>
        <div className="container w-full mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Mostrar error específico para problemas de autenticación
  if (hasAuthError(paymentsError) || hasAuthError(installmentsError)) {
    return (
      <StudentLayout>
        <div className="container w-full mx-auto p-4 sm:p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error de autenticación</h3>
                <p className="text-muted-foreground">
                  Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // Mostrar error general para otros problemas
  if (paymentsError || installmentsError) {
    return (
      <StudentLayout>
        <div className="container w-full mx-auto p-4 sm:p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error al cargar los datos</h3>
                <p className="text-muted-foreground">
                  No se pudieron cargar los datos de pagos. Inténtalo de nuevo más tarde.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Título de la página */}
        <div className="flex items-center gap-3">
          {React.createElement(CreditCard, { className: "h-8 w-8 text-primary" })}
          <div>
            <h1 className="text-3xl font-bold">Mis Pagos</h1>
            <p className="text-muted-foreground">
              Consulta tu historial de pagos y estado de cuotas
            </p>
          </div>
        </div>

        {/* Resumen financiero */}
        {typedSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pagado</p>
                    <p className="text-xl font-bold">{formatCurrency(typedSummary.totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pendiente</p>
                    <p className="text-xl font-bold">{formatCurrency(typedSummary.totalPending)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vencidas</p>
                    <p className="text-xl font-bold">{typedSummary.overdueCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cuotas</p>
                    <p className="text-xl font-bold">{typedSummary.installmentsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs para pagos y cuotas */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">Historial de Pagos</TabsTrigger>
            <TabsTrigger value="installments">Plan de Pagos</TabsTrigger>
          </TabsList>

          {/* Tab de Historial de Pagos */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                {payments && Array.isArray(payments) && payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className="capitalize">{payment.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.documentsStatus || 'Pago de matrícula'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Completado
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay pagos registrados</h3>
                    <p className="text-muted-foreground">
                      Aún no se han registrado pagos en tu cuenta.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Plan de Pagos */}
          <TabsContent value="installments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan de Pagos / Cuotas</CardTitle>
              </CardHeader>
              <CardContent>
                {installments && Array.isArray(installments) && installments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cuota #</TableHead>
                        <TableHead>Fecha Vencimiento</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Comprobante</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installments.map((installment: any) => {
                        const status = getInstallmentStatus(installment);
                        const StatusIcon = status.icon;
                        
                        // Log de depuración para ver los datos
                        console.log('Cuota:', {
                          id: installment.id,
                          status: installment.status,
                          statusLabel: status.label,
                          support: installment.support,
                          shouldShowButton: installment.status === 'pendiente' && !installment.support
                        });
                        
                        // Determinar qué mostrar en la columna de comprobante
                        const showUploadButton = installment.status === 'pendiente' && !installment.support;
                        const hasSupport = installment.support;
                        
                        return (
                          <TableRow key={installment.id}>
                            <TableCell className="font-medium">
                              {installment.installmentNumber}
                            </TableCell>
                            <TableCell>
                              {installment.dueDate ? formatDate(installment.dueDate) : 'No definida'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(installment.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {hasSupport ? (
                                <Button
                                  variant="link"
                                  onClick={() => handleOpenViewer(installment.support, installment.installmentNumber)}
                                  className="p-0 h-auto text-primary hover:underline"
                                >
                                  Ver comprobante
                                </Button>
                              ) : showUploadButton ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenUploadModal(installment)}
                                  className="flex items-center gap-2"
                                >
                                  <Upload className="h-4 w-4" />
                                  Subir soporte
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">No disponible</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay cuotas registradas</h3>
                    <p className="text-muted-foreground">
                      Aún no se han configurado cuotas en tu plan de pagos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para subir soporte de pago */}
        {selectedInstallment && (
          <UploadSupportModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            installmentId={selectedInstallment.id}
            installmentNumber={selectedInstallment.installmentNumber}
            onSuccess={handleUploadSuccess}
          />
        )}

        {/* Modal para visualizar soportes */}
        {selectedDocument && (
          <SupportViewerModal
            isOpen={isViewerOpen}
            onClose={handleCloseViewer}
            filename={selectedDocument.filename}
            installmentNumber={selectedDocument.installmentNumber}
          />
        )}
      </div>
    </StudentLayout>
  );
} 