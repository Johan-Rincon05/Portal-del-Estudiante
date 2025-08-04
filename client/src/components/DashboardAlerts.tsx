import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Calendar,
  Bell
} from 'lucide-react';
import { useLocation } from 'wouter';

interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface DashboardAlertsProps {
  alerts: AlertItem[];
  pendingDocuments: number;
  rejectedDocuments: number;
  pendingRequests: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    date: string;
    type: 'document' | 'payment' | 'request';
  }>;
}

export function DashboardAlerts({
  alerts,
  pendingDocuments,
  rejectedDocuments,
  pendingRequests,
  upcomingDeadlines
}: DashboardAlertsProps) {
  const [, setLocation] = useLocation();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Media</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Baja</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilDeadline = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'payment':
        return <Calendar className="h-4 w-4" />;
      case 'request':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alertas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alertas automáticas basadas en el estado */}
          {pendingDocuments > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <FileText className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Documentos pendientes de subir</p>
                    <p className="text-sm">Tienes {pendingDocuments} documento(s) pendiente(s) por subir.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/documents')}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    Ver Documentos
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {rejectedDocuments > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Documentos rechazados</p>
                    <p className="text-sm">Tienes {rejectedDocuments} documento(s) rechazado(s) que requieren corrección.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/documents')}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Revisar
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {pendingRequests > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Solicitudes en proceso</p>
                    <p className="text-sm">Tienes {pendingRequests} solicitud(es) pendiente(s) de respuesta.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/requests')}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    Ver Solicitudes
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Alertas personalizadas */}
          {alerts.map((alert) => (
            <Alert key={alert.id} className={getAlertVariant(alert.type)}>
              {getAlertIcon(alert.type)}
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{alert.title}</p>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(alert.createdAt)}
                    </p>
                  </div>
                  {alert.action && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation(alert.action!.href)}
                    >
                      {alert.action.label}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}

          {alerts.length === 0 && pendingDocuments === 0 && rejectedDocuments === 0 && pendingRequests === 0 && (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-muted-foreground">¡Todo está al día! No hay alertas pendientes.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos Vencimientos */}
      {upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximos Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => {
                const daysUntil = getDaysUntilDeadline(deadline.date);
                const isUrgent = daysUntil <= 3;
                const isWarning = daysUntil <= 7;

                return (
                  <div 
                    key={deadline.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isUrgent 
                        ? 'border-red-200 bg-red-50' 
                        : isWarning 
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getDeadlineIcon(deadline.type)}
                      <div>
                        <p className={`font-medium ${
                          isUrgent ? 'text-red-800' : 
                          isWarning ? 'text-yellow-800' : 'text-gray-800'
                        }`}>
                          {deadline.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vence el {formatDate(deadline.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        isUrgent ? 'destructive' : 
                        isWarning ? 'secondary' : 'outline'
                      } className="text-xs">
                        {daysUntil === 0 ? 'Hoy' : 
                         daysUntil === 1 ? 'Mañana' : 
                         `${daysUntil} días`}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          switch (deadline.type) {
                            case 'document':
                              setLocation('/documents');
                              break;
                            case 'payment':
                              setLocation('/payments');
                              break;
                            case 'request':
                              setLocation('/requests');
                              break;
                          }
                        }}
                      >
                        Ver
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 