import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  CreditCard, 
  Calendar, 
  Search, 
  Filter, 
  Download,
  Eye,
  PieChart,
  Activity,
  Loader2
} from 'lucide-react';
import { useProfiles } from '@/hooks/use-profiles';
import { useAllDocuments } from '@/hooks/use-documents';
import { useAllPayments } from '@/hooks/use-payments';

export default function ReportsPage() {
  console.log('ReportsPage renderizando...'); // Debug log

  // Obtener datos reales desde la base de datos
  const { allProfiles, isLoading: profilesLoading } = useProfiles();
  const { documents, isLoading: documentsLoading } = useAllDocuments();
  const { data: payments, isLoading: paymentsLoading } = useAllPayments();

  // Calcular estadísticas reales
  const stats = {
    totalStudents: allProfiles?.length || 0,
    totalDocuments: documents?.length || 0,
    totalPayments: payments?.length || 0,
    approvedDocuments: documents?.filter(doc => doc.status === 'aprobado').length || 0,
    pendingDocuments: documents?.filter(doc => doc.status === 'pendiente').length || 0,
    approvedPayments: payments?.filter(payment => payment.status === 'aprobado').length || 0,
    pendingPayments: payments?.filter(payment => payment.status === 'pendiente').length || 0,
    totalRevenue: payments
      ?.filter(payment => payment.status === 'aprobado')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
  };

  const isLoading = profilesLoading || documentsLoading || paymentsLoading;

  return (
    <AdminLayout>
      <div className="container w-full max-w-7xl mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Vista general del sistema y métricas de rendimiento
              </p>
            </div>
            <Button className="mt-3 sm:mt-0">
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalStudents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Documentos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalDocuments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Pagos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalPayments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${stats.totalRevenue.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas detalladas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estado de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Aprobados</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : stats.approvedDocuments}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pendientes</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : stats.pendingDocuments}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Estado de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Aprobados</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : stats.approvedPayments}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pendientes</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : stats.pendingPayments}
                      </Badge>
                    </div>
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
                  <label htmlFor="date-range" className="sr-only">Rango de fechas</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date-range"
                      name="date-range"
                      type="date"
                      className="w-full md:w-auto"
                    />
                    <span className="text-muted-foreground">a</span>
                    <Input
                      name="date-range-end"
                      type="date"
                      className="w-full md:w-auto"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <div className="w-full md:w-48">
                    <label htmlFor="report-type" className="sr-only">Tipo de reporte</label>
                    <Select>
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Tipo de reporte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Reporte General</SelectItem>
                        <SelectItem value="documents">Reporte de Documentos</SelectItem>
                        <SelectItem value="payments">Reporte de Pagos</SelectItem>
                        <SelectItem value="students">Reporte de Estudiantes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button>
                    <Filter className="mr-2 h-4 w-4" />
                    Generar Reporte
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
              <BarChart3 className="h-5 w-5" />
              Análisis Detallado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Esta funcionalidad estará disponible próximamente. Aquí podrás generar reportes detallados y análisis estadísticos del sistema.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Vista Previa
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Reporte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 