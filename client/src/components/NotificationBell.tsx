/**
 * Componente de Campana de Notificaciones
 * Muestra un ícono de campana con indicador de notificaciones no leídas
 * y un panel desplegable con la lista de notificaciones
 */

import React from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotificationSystem } from '../hooks/use-notifications';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente principal de la campana de notificaciones
 */
export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoadingNotifications,
    isLoadingCount,
    isMarkingAsRead,
    isMarkingAllAsRead,
    openNotifications,
    closeNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotificationSystem();

  const [, setLocation] = useLocation();

  /**
   * Maneja el clic en una notificación
   * Marca como leída y navega al enlace si existe
   */
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    
    if (notification.link) {
      setLocation(notification.link);
      closeNotifications();
    }
  };

  /**
   * Formatea la fecha de la notificación
   */
  const formatNotificationDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'Hace un momento';
    }
  };

  /**
   * Obtiene el ícono según el tipo de notificación
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'request':
        return '📝';
      case 'stage':
        return '🎓';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      {/* Botón de la campana */}
      <Button
        variant="ghost"
        size="icon"
        onClick={openNotifications}
        className="relative h-10 w-10"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        
        {/* Indicador de notificaciones no leídas */}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 z-50">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Notificaciones
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={isMarkingAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeNotifications}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-80">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                            !notification.isRead ? 'bg-muted/30' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Ícono de tipo de notificación */}
                            <div className="text-lg mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Contenido de la notificación */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm font-medium line-clamp-1 ${
                                  !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {notification.title}
                                </h4>
                                
                                {/* Indicador de no leída */}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.body}
                              </p>
                              
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                            </div>

                            {/* Botón para marcar como leída */}
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                disabled={isMarkingAsRead}
                                className="h-6 w-6 flex-shrink-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Separador entre notificaciones */}
                        {index < notifications.length - 1 && (
                          <Separator className="mx-3" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay para cerrar al hacer clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeNotifications}
        />
      )}
    </div>
  );
} 