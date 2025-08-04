import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Filter, 
  Search, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  FileText as FileTextIcon
} from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { toast } from 'sonner';

interface ReportData {
  students: {
    total: number;
    active: number;
    inactive: number;
    byStage: { stage: string; count: number }[];
    byMonth: { month: string; count: number }[];
  };
  documents: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: { type: string; count: number }[];
    byStatus: { status: string; count: number }[];
  };
  payments: {
    total: number;
    totalAmount: number;
    pending: number;
    approved: number;
    rejected: number;
    byMethod: { method: string; count: number; amount: number }[];
    byMonth: { month: string; count: number; amount: number }[];
  };
  requests: {
    total: number;
    pending: number;
    completed: number;
    byType: { type: string; count: number }[];
    byStatus: { status: string; count: number }[];
  };
}

// Componente simple de gráfico de barras
function BarChart({ data, title, height = 200 }: { data: { label: string; value: number }[]; title: string; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="space-y-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6">
              <div 
                className="bg-blue-600 h-6 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-right">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente simple de gráfico circular
function SimplePieChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const rotation = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
            
            return (
              <div
                key={index}
                className="absolute inset-0 rounded-full border-8 border-transparent"
                style={{
                  borderTopColor: item.color,
                  transform: `rotate(${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + percentage * 0.5}% 0%, ${50 + percentage * 0.5}% 50%)`
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    reportType: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simular datos de reporte (reemplazar con API real)
  useEffect(() => {
    const mockData: ReportData = {
      students: {
        total: 1250,
        active: 1180,
        inactive: 70,
        byStage: [
          { stage: 'Inscripción', count: 150 },
          { stage: 'Documentación', count: 320 },
          { stage: 'Pago', count: 280 },
          { stage: 'Matriculado', count: 500 }
        ],
        byMonth: [
          { month: 'Ene', count: 120 },
          { month: 'Feb', count: 180 },
          { month: 'Mar', count: 220 },
          { month: 'Abr', count: 190 },
          { month: 'May', count: 250 },
          { month: 'Jun', count: 290 }
        ]
      },
      documents: {
        total: 3750,
        pending: 450,
        approved: 3100,
        rejected: 200,
        byType: [
          { type: 'DNI', count: 1250 },
          { type: 'Certificado Estudios', count: 1250 },
          { type: 'Comprobante Pago', count: 750 },
          { type: 'Foto Carnet', count: 500 }
        ],
        byStatus: [
          { status: 'Aprobado', count: 3100 },
          { status: 'Pendiente', count: 450 },
          { status: 'Rechazado', count: 200 }
        ]
      },
      payments: {
        total: 1800,
        totalAmount: 2700000,
        pending: 120,
        approved: 1600,
        rejected: 80,
        byMethod: [
          { method: 'Transferencia', count: 900, amount: 1350000 },
          { method: 'Tarjeta', count: 600, amount: 900000 },
          { method: 'PayPal', count: 300, amount: 450000 }
        ],
        byMonth: [
          { month: 'Ene', count: 280, amount: 420000 },
          { month: 'Feb', count: 320, amount: 480000 },
          { month: 'Mar', count: 350, amount: 525000 },
          { month: 'Abr', count: 300, amount: 450000 },
          { month: 'May', count: 380, amount: 570000 },
          { month: 'Jun', count: 170, amount: 255000 }
        ]
      },
      requests: {
        total: 850,
        pending: 120,
        completed: 730,
        byType: [
          { type: 'Cambio de Carrera', count: 200 },
          { type: 'Beca', count: 350 },
          { type: 'Certificado', count: 300 }
        ],
        byStatus: [
          { status: 'Completado', count: 730 },
          { status: 'Pendiente', count: 120 }
        ]
      }
    };
    
    setReportData(mockData);
  }, []);

  const handleExportReport = (type: string) => {
    toast.success(`Reporte ${type} exportado exitosamente`);
    // TODO: Implementar exportación real
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    // TODO: Implementar actualización de datos
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Datos actualizados');
    }, 1000);
  };

  if (!reportData) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reportes Detallados</h1>
              <p className="text-gray-600 mt-2">
                Análisis completo del sistema y métricas de rendimiento
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar Todo
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Fecha Desde</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha Hasta</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Tipo de Reporte</Label>
                <Select 
                  value={filters.reportType} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="students">Estudiantes</SelectItem>
                    <SelectItem value="documents">Documentos</SelectItem>
                    <SelectItem value="payments">Pagos</SelectItem>
                    <SelectItem value="requests">Solicitudes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Solicitudes
            </TabsTrigger>
          </TabsList>

          {/* Tab de Resumen */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.students.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Documentos Aprobados</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.documents.approved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pagos Aprobados</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.payments.approved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(reportData.payments.totalAmount / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estudiantes por Etapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={reportData.students.byStage.map(s => ({ label: s.stage, value: s.count }))}
                    title=""
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart 
                    data={[
                      { label: 'Aprobados', value: reportData.documents.approved, color: '#10B981' },
                      { label: 'Pendientes', value: reportData.documents.pending, color: '#F59E0B' },
                      { label: 'Rechazados', value: reportData.documents.rejected, color: '#EF4444' }
                    ]}
                    title=""
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Estudiantes */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estudiantes por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={reportData.students.byMonth.map(s => ({ label: s.month, value: s.count }))}
                    title=""
                    height={300}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Etapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart 
                    data={reportData.students.byStage.map((s, i) => ({
                      label: s.stage,
                      value: s.count,
                      color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i % 4]
                    }))}
                    title=""
                  />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Acciones de Reporte</span>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportReport('Estudiantes')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportReport('Estudiantes PDF')}>
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Tab de Documentos */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={reportData.documents.byType.map(d => ({ label: d.type, value: d.count }))}
                    title=""
                    height={300}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart 
                    data={[
                      { label: 'Aprobados', value: reportData.documents.approved, color: '#10B981' },
                      { label: 'Pendientes', value: reportData.documents.pending, color: '#F59E0B' },
                      { label: 'Rechazados', value: reportData.documents.rejected, color: '#EF4444' }
                    ]}
                    title=""
                  />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Acciones de Reporte</span>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportReport('Documentos')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportReport('Documentos PDF')}>
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Tab de Pagos */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pagos por Método</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={reportData.payments.byMethod.map(p => ({ 
                      label: p.method, 
                      value: p.count 
                    }))}
                    title=""
                    height={300}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pagos por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={reportData.payments.byMonth.map(p => ({ 
                      label: p.month, 
                      value: p.count 
                    }))}
                    title=""
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Monto Recaudado por Método</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.payments.byMethod.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{method.method}</span>
                      <span className="text-lg font-bold text-green-600">
                        ${(method.amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Acciones de Reporte</span>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportReport('Pagos')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportReport('Pagos PDF')}>
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Tab de Solicitudes */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={reportData.requests.byType.map(r => ({ label: r.type, value: r.count }))}
                    title=""
                    height={300}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart 
                    data={[
                      { label: 'Completadas', value: reportData.requests.completed, color: '#10B981' },
                      { label: 'Pendientes', value: reportData.requests.pending, color: '#F59E0B' }
                    ]}
                    title=""
                  />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Acciones de Reporte</span>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportReport('Solicitudes')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportReport('Solicitudes PDF')}>
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 