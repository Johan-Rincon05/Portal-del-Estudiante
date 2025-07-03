import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Download,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useAllPayments } from '@/hooks/use-payments';

export default function PaymentValidationPage() {
  console.log('PaymentValidationPage renderizando...'); // Debug log

  // Obtener todos los pagos para estadísticas
  const { data: payments, isLoading } = useAllPayments();

  // Calcular estadísticas reales desde la base de datos
  const stats = {
    total: payments?.length || 0,
    pendientes: payments?.filter(payment => payment.status === 'pendiente').length || 0,
    aprobados: payments?.filter(payment => payment.status === 'aprobado').length || 0,
    rechazados: payments?.filter(payment => payment.status === 'rechazado').length || 0
  };

  // Calcular monto total aprobado
  const totalAmount = payments
    ?.filter(payment => payment.status === 'aprobado')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  return (
    <AdminLayout>
      <div className="container w-full max-w-7xl mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Validación de Pagos</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Revisa y valida los pagos realizados por los estudiantes
              </p>
            </div>
            <Button className="mt-3 sm:mt-0">
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
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
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendientes}
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
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.aprobados}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.rechazados}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Aprobado</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${totalAmount.toLocaleString()}`}
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
                  <label htmlFor="search-payments" className="sr-only">Buscar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="search-payments"
                      name="search-payments"
                      type="text"
                      placeholder="Buscar pagos por estudiante o referencia"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <div className="w-full md:w-48">
                    <label htmlFor="status" className="sr-only">Estado</label>
                    <Select>
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
                    <label htmlFor="method" className="sr-only">Método</label>
                    <Select>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Todos los métodos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los métodos</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
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
              <CreditCard className="h-5 w-5" />
              Pagos Pendientes de Validación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Esta funcionalidad estará disponible próximamente. Aquí podrás revisar y validar todos los pagos realizados por los estudiantes.
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
      </div>
    </AdminLayout>
  );
} 