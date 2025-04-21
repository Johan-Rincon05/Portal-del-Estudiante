import { useAuth } from "@/hooks/use-auth";
import { useRequests } from "@/hooks/use-requests";
import { useDocuments } from "@/hooks/use-documents";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, AlertCircle, CheckCircle, User, ArrowRight } from "lucide-react";
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
      color: pendingDocuments > 0 ? "text-yellow-600" : "text-green-600",
      bgColor: pendingDocuments > 0 ? "bg-yellow-50" : "bg-green-50",
      borderColor: pendingDocuments > 0 ? "border-yellow-200" : "border-green-200",
      action: () => setLocation("/documents")
    },
    {
      title: "Solicitudes Activas",
      value: pendingRequests,
      description: "Solicitudes en proceso",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      action: () => setLocation("/requests")
    },
    {
      title: "Solicitudes Completadas",
      value: completedRequests,
      description: "Solicitudes resueltas",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      action: () => setLocation("/requests")
    }
  ];

  return (
    <StudentLayout>
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Bienvenida */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">
              Bienvenido, <span className="text-primary">{user?.username}</span>
            </h1>
            <p className="text-muted-foreground">
              Este es tu panel de control. Aquí podrás gestionar tus documentos y solicitudes.
            </p>
          </div>

          {/* Alertas */}
          {pendingDocuments > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>Tienes {pendingDocuments} documento(s) pendiente(s) por subir.</p>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/60 backdrop-blur-sm border">
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

            <Card className="bg-card/60 backdrop-blur-sm border">
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

            <Card className="bg-card/60 backdrop-blur-sm border">
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
                  <span className="font-semibold group-hover:text-primary transition-colors duration-300">Nueva Solicitud</span>
                </div>
                <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors duration-300 text-left">
                  Crea una nueva solicitud o consulta el estado de las existentes
                </span>
                <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary transition-all duration-300 ml-auto transform translate-x-[-10px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}