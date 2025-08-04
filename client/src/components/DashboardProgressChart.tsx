import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Target,
  Calendar
} from 'lucide-react';

interface DashboardProgressChartProps {
  currentStage: string;
  documentsCount: number;
  totalDocuments: number;
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  pendingRequests: number;
  completedRequests: number;
}

const ENROLLMENT_STAGES = [
  { key: 'suscrito', label: 'Suscrito', progress: 10 },
  { key: 'documentos_completos', label: 'Documentos', progress: 25 },
  { key: 'registro_validado', label: 'Registro', progress: 40 },
  { key: 'proceso_universitario', label: 'Universidad', progress: 55 },
  { key: 'matriculado', label: 'Matriculado', progress: 70 },
  { key: 'inicio_clases', label: 'Inicio Clases', progress: 85 },
  { key: 'estudiante_activo', label: 'Estudiante Activo', progress: 95 },
  { key: 'pagos_al_dia', label: 'Pagos al Día', progress: 98 },
  { key: 'proceso_finalizado', label: 'Finalizado', progress: 100 },
];

export function DashboardProgressChart({
  currentStage,
  documentsCount,
  totalDocuments,
  approvedDocuments,
  pendingDocuments,
  rejectedDocuments,
  pendingRequests,
  completedRequests
}: DashboardProgressChartProps) {
  const currentStageIndex = ENROLLMENT_STAGES.findIndex(stage => stage.key === currentStage);
  const currentProgress = ENROLLMENT_STAGES[currentStageIndex]?.progress || 0;
  const nextStage = ENROLLMENT_STAGES[currentStageIndex + 1];
  
  const documentsProgress = totalDocuments > 0 ? (documentsCount / totalDocuments) * 100 : 0;
  const requestsProgress = (pendingRequests + completedRequests) > 0 
    ? (completedRequests / (pendingRequests + completedRequests)) * 100 
    : 0;

  const getStageStatus = (stageIndex: number) => {
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progreso General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progreso General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso del Proceso</span>
              <span className="text-sm text-muted-foreground">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-3" />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Etapa actual: {ENROLLMENT_STAGES[currentStageIndex]?.label}</span>
              {nextStage && (
                <span>Siguiente: {nextStage.label}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Estado de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Documentos Completados</span>
              <span className="text-sm text-muted-foreground">
                {documentsCount} de {totalDocuments}
              </span>
            </div>
            <Progress value={documentsProgress} className="h-3" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">{approvedDocuments}</span>
              </div>
              <span className="text-xs text-muted-foreground">Aprobados</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">{pendingDocuments}</span>
              </div>
              <span className="text-xs text-muted-foreground">Pendientes</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">{rejectedDocuments}</span>
              </div>
              <span className="text-xs text-muted-foreground">Rechazados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso de Solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Estado de Solicitudes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Solicitudes Completadas</span>
              <span className="text-sm text-muted-foreground">
                {completedRequests} de {pendingRequests + completedRequests}
              </span>
            </div>
            <Progress value={requestsProgress} className="h-3" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">{pendingRequests}</span>
              </div>
              <span className="text-xs text-muted-foreground">Pendientes</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">{completedRequests}</span>
              </div>
              <span className="text-xs text-muted-foreground">Completadas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Etapas del Proceso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Etapas del Proceso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ENROLLMENT_STAGES.map((stage, index) => {
              const status = getStageStatus(index);
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${
                        status === 'current' ? 'font-semibold text-primary' : 
                        status === 'completed' ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {stage.label}
                      </span>
                      <Badge variant={
                        status === 'completed' ? 'default' : 
                        status === 'current' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {stage.progress}%
                      </Badge>
                    </div>
                    {status === 'current' && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all duration-500"
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 