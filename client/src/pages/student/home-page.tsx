import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRequests } from "@/hooks/use-requests";
import { useDocuments } from "@/hooks/use-documents";
import { useProfiles } from "@/hooks/use-profiles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, AlertCircle, CheckCircle, User, ArrowRight, Edit, Building, GraduationCap, Calendar, UserCheck, CreditCard, Eye, Circle, ArrowDown } from "lucide-react";
import { useLocation } from "wouter";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Tooltip } from "@/components/ui/tooltip";
import { DashboardProgressChart } from "@/components/DashboardProgressChart";
import { DashboardAlerts } from "@/components/DashboardAlerts";

// Definición de las etapas del proceso de matrícula con fechas estimadas
const ENROLLMENT_STAGES = [
  { key: 'suscrito', label: 'Suscrito', icon: User, description: 'Cuenta creada', estimatedDays: 0 },
  { key: 'documentos_completos', label: 'Documentos', icon: FileText, description: 'Documentación completa', estimatedDays: 7 },
  { key: 'registro_validado', label: 'Registro', icon: Edit, description: 'Validación de datos', estimatedDays: 14 },
  { key: 'proceso_universitario', label: 'Universidad', icon: Building, description: 'Proceso universitario', estimatedDays: 21 },
  { key: 'matriculado', label: 'Matriculado', icon: GraduationCap, description: 'Matrícula confirmada', estimatedDays: 28 },
  { key: 'inicio_clases', label: 'Inicio Clases', icon: Calendar, description: 'Pronto a comenzar', estimatedDays: 35 },
  { key: 'estudiante_activo', label: 'Estudiante', icon: UserCheck, description: 'Estado activo', estimatedDays: 42 },
  { key: 'pagos_al_dia', label: 'Pagos', icon: CreditCard, description: 'Finanzas al día', estimatedDays: 49 },
  { key: 'proceso_finalizado', label: 'Finalizado', icon: CheckCircle, description: 'Proceso completado', estimatedDays: 56 },
];

type TimelineView = 'horizontal' | 'circular';

export default function HomePage() {
  const { user } = useAuth();
  const { requests } = useRequests();
  const { documents } = useDocuments();
  const { profile } = useProfiles(user?.id?.toString());
  const [, setLocation] = useLocation();
  const [timelineView, setTimelineView] = useState<TimelineView>('horizontal');

    // Memoizar contadores para evitar recálculos innecesarios
  const stats = React.useMemo(() => {
    const pendingRequests = requests?.filter(r => r.status === "pendiente" || r.status === "en_proceso").length || 0;
    const completedRequests = requests?.filter(r => r.status === "completada").length || 0;
    const uploadedDocuments = documents?.length || 0;
    const pendingDocuments = 5 - uploadedDocuments;
    const approvedDocuments = documents?.filter(d => d.status === 'aprobado').length || 0;
    const rejectedDocuments = documents?.filter(d => d.status === 'rechazado').length || 0;

    return {
      pendingRequests,
      completedRequests,
      uploadedDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments
    };
  }, [requests, documents]);

  // Obtener la etapa actual del estudiante con validación
  const currentStage = profile?.enrollmentStage || 'suscrito';
  const currentStageIndex = ENROLLMENT_STAGES.findIndex(stage => stage.key === currentStage);

  // Función para determinar el estado visual de cada etapa
  const getStageStatus = (stageIndex: number) => {
    if (stageIndex < currentStageIndex) {
      return 'completed'; // Etapa completada
    } else if (stageIndex === currentStageIndex) {
      return 'current'; // Etapa actual
    } else {
      return 'pending'; // Etapa pendiente
    }
  };

  // Función para obtener los estilos de cada etapa
  const getStageStyles = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return {
          container: 'bg-primary/10 border-primary/30 shadow-md',
          icon: 'text-primary',
          label: 'text-primary font-semibold',
          description: 'text-primary/70',
          line: 'bg-primary/40',
          date: 'text-primary/60'
        };
      case 'current':
        return {
          container: 'bg-primary/20 border-primary/50 shadow-xl ring-2 ring-primary/20',
          icon: 'text-primary',
          label: 'text-primary font-bold',
          description: 'text-primary/80',
          line: 'bg-primary/50',
          date: 'text-primary font-semibold'
        };
      case 'pending':
        return {
          container: 'bg-muted/50 border-muted',
          icon: 'text-muted-foreground/50',
          label: 'text-muted-foreground/70',
          description: 'text-muted-foreground/50',
          line: 'bg-muted-foreground/30',
          date: 'text-muted-foreground/50'
        };
    }
  };

  // Calcular progreso porcentual
  const progressPercentage = ((currentStageIndex + 1) / ENROLLMENT_STAGES.length) * 100;

  // Función para obtener fecha estimada
  const getEstimatedDate = (daysFromStart: number) => {
    const today = new Date();
    const estimatedDate = new Date(today.getTime() + (daysFromStart * 24 * 60 * 60 * 1000));
    return estimatedDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  // Componente Timeline 5 arriba y 4 abajo (desktop/tablet), vertical en móvil
  const TwoRowTimeline = () => {
    // Definir cuántas etapas van arriba y cuántas abajo
    const topCount = 5;
    const bottomCount = ENROLLMENT_STAGES.length - topCount; // 4
    const topStages = ENROLLMENT_STAGES.slice(0, topCount);
    const bottomStages = ENROLLMENT_STAGES.slice(topCount);
    // Grid de columnas dobles: 5 etapas => 9 columnas (etapa, flecha, etapa, ...)
    return (
      <div className="w-full">
        {/* Desktop/tablet: dos filas, grid de columnas dobles para flechas alineadas */}
        <div className="hidden sm:grid relative py-8 w-full grid-cols-9 grid-rows-2 gap-y-12 gap-x-0 lg:gap-x-2">
          {/* Fila superior: etapas y flechas */}
          {topStages.map((stage, index) => {
            const status = getStageStatus(index);
            const styles = getStageStyles(status);
            // Columna para la etapa (índices impares: 1,3,5,7,9)
            const col = index * 2 + 1;
            return (
              <React.Fragment key={stage.key}>
                <div
                  className="flex flex-col items-center text-center transition-all duration-300 hover:scale-105 z-10"
                  style={{ gridRow: 1, gridColumn: col }}
                >
                  {/* Círculo con icono */}
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full ${styles.container} flex items-center justify-center border-2 transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 mb-2 lg:mb-3 relative z-10`}>
                    <stage.icon className={`h-7 w-7 lg:h-8 lg:w-8 ${styles.icon}`} />
                    {status === 'current' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  {/* Nombre de la etapa */}
                  <span className={`font-medium text-xs lg:text-sm transition-colors group-hover:text-primary mb-0.5 lg:mb-1 ${styles.label}`}>{stage.label}</span>
                  {/* Descripción */}
                  <span className={`text-[10px] lg:text-xs max-w-[80px] lg:max-w-[100px] mx-auto mb-1 lg:mb-2 ${styles.description}`}>{stage.description}</span>
                </div>
                {/* Flecha a la siguiente etapa, excepto la última */}
                {index < topStages.length - 1 && (
                  <div
                    className="flex items-center justify-center z-20"
                    style={{ gridRow: 1, gridColumn: col + 1 }}
                  >
                    <ArrowRight className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
          {/* Fila inferior: etapas y flechas */}
          {bottomStages.map((stage, index) => {
            // 4 etapas => 7 columnas (1,3,5,7 para etapas; 2,4,6 para flechas)
            const status = getStageStatus(topCount + index);
            const styles = getStageStyles(status);
            // Centramos las etapas bajo las columnas 2-8 (de 1 a 7)
            const col = index * 2 + 2;
            return (
              <React.Fragment key={stage.key}>
                <div
                  className="flex flex-col items-center text-center transition-all duration-300 hover:scale-105 z-10"
                  style={{ gridRow: 2, gridColumn: col }}
                >
                  {/* Círculo con icono */}
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full ${styles.container} flex items-center justify-center border-2 transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 mb-2 lg:mb-3 relative z-10`}>
                    <stage.icon className={`h-7 w-7 lg:h-8 lg:w-8 ${styles.icon}`} />
                    {status === 'current' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  {/* Nombre de la etapa */}
                  <span className={`font-medium text-xs lg:text-sm transition-colors group-hover:text-primary mb-0.5 lg:mb-1 ${styles.label}`}>{stage.label}</span>
                  {/* Descripción */}
                  <span className={`text-[10px] lg:text-xs max-w-[80px] lg:max-w-[100px] mx-auto mb-1 lg:mb-2 ${styles.description}`}>{stage.description}</span>
                </div>
                {/* Flecha a la siguiente etapa, excepto la última */}
                {index < bottomStages.length - 1 && (
                  <div
                    className="flex items-center justify-center z-20"
                    style={{ gridRow: 2, gridColumn: col + 1 }}
                  >
                    <ArrowRight className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Timeline vertical para móvil */}
        <div className="sm:hidden flex flex-col items-center relative py-4 w-full">
          {/* Línea vertical de progreso */}
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-muted-foreground/20 via-muted-foreground/30 to-muted-foreground/20 rounded-full z-0"></div>
          {ENROLLMENT_STAGES.map((stage, index) => {
            const status = getStageStatus(index);
            const styles = getStageStyles(status);
            return (
              <React.Fragment key={stage.key}>
                <div
                  className="flex items-center w-full mb-6 last:mb-0 z-10"
                >
                  {/* Círculo con icono */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.container} flex items-center justify-center border-2 transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 mr-4 relative z-10`}>
                    <stage.icon className={`h-6 w-6 ${styles.icon}`} />
                    {status === 'current' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  {/* Información de la etapa */}
                  <div className="flex flex-col items-start">
                    <span className={`font-medium text-sm transition-colors group-hover:text-primary mb-0.5 ${styles.label}`}>{stage.label}</span>
                    <span className={`text-xs max-w-[180px] mb-1 ${styles.description}`}>{stage.description}</span>
                  </div>
                </div>
                {/* Flecha hacia abajo, excepto la última etapa */}
                {index < ENROLLMENT_STAGES.length - 1 && (
                  <ArrowDown className="w-6 h-6 text-muted-foreground/60 my-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Componente Timeline Circular (alineación perfecta de íconos)
  const CircularTimeline = () => {
    // Número total de etapas
    const total = ENROLLMENT_STAGES.length;
    // Radio del círculo de progreso
    const circleRadius = 140; // px
    // Tamaño del icono
    const iconSize = 44;
    // El centro del SVG
    const center = circleRadius + 16; // 16px de padding para stroke
    // El radio para los íconos ahora es mayor para que queden más afuera
    const iconRadius = circleRadius + 40; // Aumenta la separación de los íconos respecto al círculo
    // Tamaño del SVG
    const svgSize = (circleRadius + 16) * 2;
    // Estado para etapa activa (hover o actual)
    const [activeIndex, setActiveIndex] = React.useState(currentStageIndex);
    return (
      <div className="flex flex-col items-center justify-center py-8 w-full">
        {/* Círculo de progreso principal */}
        <div className={`relative`} style={{ width: svgSize, height: svgSize, margin: '0 auto' }}>
          {/* Círculo de fondo */}
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${svgSize} ${svgSize}`}>
            <circle
              cx={center}
              cy={center}
              r={circleRadius}
              stroke="currentColor"
              strokeWidth="16"
              fill="none"
              className="text-muted-foreground/20"
            />
            {/* Círculo de progreso */}
            <circle
              cx={center}
              cy={center}
              r={circleRadius}
              stroke="currentColor"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${2 * Math.PI * circleRadius}`}
              strokeDashoffset={`${2 * Math.PI * circleRadius * (1 - progressPercentage / 100)}`}
              className="text-primary transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          {/* Íconos perfectamente alineados sobre el borde del círculo */}
          {ENROLLMENT_STAGES.map((stage, i) => {
            // Calcular el ángulo para cada etapa
            const angle = (360 / total) * i - 90; // -90 para empezar arriba
            const rad = (angle * Math.PI) / 180;
            // Posición para el icono (centro del icono justo en el borde)
            const x = center + iconRadius * Math.cos(rad) - iconSize / 2;
            const y = center + iconRadius * Math.sin(rad) - iconSize / 2;
            const status = getStageStatus(i);
            const styles = getStageStyles(status);
            const isCurrent = i === activeIndex;
            return (
              <div
                key={stage.key}
                className={`absolute flex flex-col items-center ${isCurrent ? 'z-20' : 'z-10'}`}
                style={{ left: `${x}px`, top: `${y}px`, width: iconSize, height: iconSize, cursor: 'pointer' }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(currentStageIndex)}
                tabIndex={0}
                aria-label={stage.label}
              >
                <div className={`w-11 h-11 rounded-full ${styles.container} flex items-center justify-center border-2 transition-all duration-200 ${isCurrent ? 'ring-4 ring-primary/40 scale-110' : ''}`}>
                  <stage.icon className={`h-7 w-7 ${styles.icon}`} />
                </div>
              </div>
            );
          })}
          {/* Contenido central: nombre y descripción de la etapa activa */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <div className="text-3xl font-bold text-primary mb-1">{Math.round(progressPercentage)}%</div>
            <div className="text-lg font-semibold text-foreground mb-1">{ENROLLMENT_STAGES[activeIndex]?.label}</div>
            <div className="text-sm text-muted-foreground max-w-[220px]">{ENROLLMENT_STAGES[activeIndex]?.description}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <div className="container w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-6">
          {/* Bienvenida con estilo de marca */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className="h-1 w-8 bg-primary mr-1"></div>
                  <div className="h-1 w-5 bg-primary"></div>
                </div>
                <div className="mt-1 h-1 w-5 bg-primary"></div>
                <div className="mt-1 h-1 w-5 bg-primary"></div>
              </div>
              <h1 className="text-3xl font-bold">
                Bienvenido, <span className="text-primary">{user?.username}</span>
              </h1>
            </div>
            <p className="text-muted-foreground ml-11">
              Este es tu panel de control. Aquí podrás gestionar tus documentos y solicitudes.
            </p>
          </div>

          {/* Layout de dos columnas para dashboard mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal - Timeline y estadísticas */}
            <div className="lg:col-span-2 space-y-6">

          {/* Selector de Vista de Timeline */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Progreso de Acceso a Clases</h2>
              <p className="text-sm text-muted-foreground">Tu avance en el proceso de matrícula</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timelineView === 'horizontal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimelineView('horizontal')}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Timeline
              </Button>
              <Button
                variant={timelineView === 'circular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimelineView('circular')}
                className="flex items-center gap-2"
              >
                <Circle className="h-4 w-4" />
                Circular
              </Button>
            </div>
          </div>

          {/* Línea de Tiempo Dinámica */}
          <Card className="p-6 border border-primary/20 rounded-lg shadow-sm">
            <CardContent className="pt-4">
              {timelineView === 'horizontal' ? <TwoRowTimeline /> : <CircularTimeline />}
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/60 backdrop-blur-sm border hover:border-primary/50 transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Documentos
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Estado de tus documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uploadedDocuments}</div>
                <p className="text-muted-foreground">documentos subidos</p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border hover:border-primary/50 transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Solicitudes
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Tus solicitudes activas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <p className="text-muted-foreground">solicitudes en proceso</p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border hover:border-primary/50 transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Perfil
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Estado de tu perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completedRequests}
                </div>
                <p className="text-muted-foreground">solicitudes resueltas</p>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 bg-card hover:bg-primary/5 backdrop-blur-sm border border-border/50 group transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-md hover:scale-[1.02]"
              onClick={() => setLocation("/documents")}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold group-hover:text-primary transition-colors duration-300">Subir Documentos</span>
                </div>
                <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors duration-300 text-left">
                  Gestiona y sube los documentos requeridos para tu matrícula
                </span>
                <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary transition-all duration-300 ml-auto transform translate-x-[-10px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 bg-card hover:bg-primary/5 backdrop-blur-sm border border-border/50 group transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-md hover:scale-[1.02]"
              onClick={() => setLocation("/requests")}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold group-hover:text-primary transition-colors duration-300">Ver Solicitudes</span>
                </div>
                <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors duration-300 text-left">
                  Revisa el estado de tus solicitudes y crea nuevas si es necesario
                </span>
                <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary transition-all duration-300 ml-auto transform translate-x-[-10px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
              </div>
            </Button>
          </div>

          {/* Información adicional */}
          <Card className="bg-card/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Información Importante</CardTitle>
              <CardDescription>
                Mantente al día con los requisitos y fechas importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Asegúrate de subir todos los documentos requeridos antes de la fecha límite.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Revisa regularmente el estado de tus solicitudes para estar al tanto de cualquier actualización.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Si tienes alguna pregunta, no dudes en crear una nueva solicitud de ayuda.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Columna lateral - Alertas y progreso */}
            <div className="space-y-6">
              {/* Gráficos de progreso */}
              <DashboardProgressChart
                currentStage={currentStage}
                documentsCount={stats.uploadedDocuments}
                totalDocuments={5}
                approvedDocuments={stats.approvedDocuments}
                pendingDocuments={stats.pendingDocuments}
                rejectedDocuments={stats.rejectedDocuments}
                pendingRequests={stats.pendingRequests}
                completedRequests={stats.completedRequests}
              />

              {/* Alertas del dashboard */}
              <DashboardAlerts
                alerts={[]} // TODO: Implementar sistema de alertas
                pendingDocuments={stats.pendingDocuments}
                rejectedDocuments={stats.rejectedDocuments}
                pendingRequests={stats.pendingRequests}
                upcomingDeadlines={[]} // TODO: Implementar sistema de vencimientos
              />
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
} 