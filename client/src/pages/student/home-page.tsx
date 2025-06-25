import { useAuth } from "@/hooks/use-auth";
import { useRequests } from "@/hooks/use-requests";
import { useDocuments } from "@/hooks/use-documents";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, AlertCircle, CheckCircle, User, ArrowRight, Edit, Building, GraduationCap, Calendar, UserCheck, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { StudentLayout } from "@/components/layouts/StudentLayout";

export default function HomePage() {
  const { user } = useAuth();
  const { requests } = useRequests();
  const { documents } = useDocuments();
  const [, setLocation] = useLocation();

  // Contadores
  const pendingRequests = requests?.filter(r => r.status === "pendiente" || r.status === "en_proceso").length || 0;
  const completedRequests = requests?.filter(r => r.status === "completada").length || 0;
  const uploadedDocuments = documents?.length || 0;
  const pendingDocuments = 5 - uploadedDocuments;

  const stats = [
    {
      title: "Documentos Pendientes",
      value: pendingDocuments,
      description: "Documentos requeridos por subir",
      icon: FileText,
      color: pendingDocuments > 0 ? "text-secondary" : "text-primary",
      bgColor: pendingDocuments > 0 ? "bg-secondary/10" : "bg-primary/10",
      borderColor: pendingDocuments > 0 ? "border-secondary/20" : "border-primary/20",
      action: () => setLocation("/documents")
    },
    {
      title: "Solicitudes Activas",
      value: pendingRequests,
      description: "Solicitudes en proceso",
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      action: () => setLocation("/requests")
    },
    {
      title: "Solicitudes Completadas",
      value: completedRequests,
      description: "Solicitudes resueltas",
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      action: () => setLocation("/requests")
    }
  ];

  return (
    <StudentLayout>
      <div className="container max-w-5xl mx-auto px-4 py-6">
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

          {/* Alertas */}
          {pendingDocuments > 0 && (
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 flex items-center gap-3 text-secondary">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>Tienes {pendingDocuments} documento(s) pendiente(s) por subir.</p>
            </div>
          )}

          {/* Nueva Timeline */}
          <Card className="p-6 border border-primary/20 rounded-lg shadow-sm mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary">Progreso de Acceso a Clases</CardTitle>
              <CardDescription>Tu avance en el proceso de matrícula</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative py-8">
                {/* Línea de tiempo */}
                <div className="absolute top-1/2 left-4 right-4 h-2 bg-primary/20 rounded-full"></div>
                
                {/* Contenedor de elementos */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-8 relative">
                  {[
                    { label: 'Suscrito', icon: User, color: 'bg-primary/10', description: 'Cuenta creada' },
                    { label: 'Documentos', icon: FileText, color: 'bg-secondary/10', description: 'Documentación completa' },
                    { label: 'Registro', icon: Edit, color: 'bg-primary/10', description: 'Validación de datos' },
                    { label: 'Universidad', icon: Building, color: 'bg-secondary/10', description: 'Proceso universitario' },
                    { label: 'Matriculado', icon: GraduationCap, color: 'bg-primary/10', description: 'Matrícula confirmada' },
                    { label: 'Inicio Clases', icon: Calendar, color: 'bg-secondary/10', description: 'Pronto a comenzar' },
                    { label: 'Estudiante', icon: UserCheck, color: 'bg-primary/10', description: 'Estado activo' },
                    { label: 'Pagos', icon: CreditCard, color: 'bg-secondary/10', description: 'Finanzas al día' },
                    { label: 'Finalizado', icon: CheckCircle, color: 'bg-primary/10', description: 'Proceso completado' },
                  ].map((step, index) => (
                    <div key={index} className="relative z-10 flex flex-col items-center group text-center transition-all duration-300 hover:scale-105">
                      <div className={`w-14 h-14 rounded-full ${step.color} flex items-center justify-center border-2 border-primary shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 mb-3`}>
                        <step.icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="font-medium text-sm text-foreground transition-colors group-hover:text-primary mb-1">{step.label}</span>
                      <span className="text-xs text-muted-foreground max-w-[100px] mx-auto">{step.description}</span>
                      {index < 8 && (
                        <div className="absolute top-7 left-[calc(50%+35px)] w-[calc(100%-70px)] h-[2px] bg-primary/30"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                <div className="text-2xl font-bold">{uploadedDocuments}</div>
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
                <div className="text-2xl font-bold">{pendingRequests}</div>
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
                  {completedRequests}
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
      </div>
    </StudentLayout>
  );
} 