/**
 * Hook para manejar notificaciones
 * Proporciona funciones para obtener, marcar como leídas y gestionar notificaciones
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Definir el tipo Notification localmente para evitar problemas de importación
interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Tipos para las respuestas de la API
interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  count: number;
}

interface UnreadCountResponse {
  success: boolean;
  count: number;
}

interface MarkReadResponse {
  success: boolean;
  message: string;
}

/**
 * Hook para obtener las notificaciones del usuario
 * @param limit - Número máximo de notificaciones a obtener (default: 10)
 * @param unreadOnly - Si es true, solo obtiene notificaciones no leídas
 */
export function useNotifications(limit: number = 10, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ['notifications', limit, unreadOnly],
    queryFn: async (): Promise<Notification[]> => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(unreadOnly && { unreadOnly: 'true' })
      });

      const response = await api.get<NotificationsResponse>(`/notifications?${params}`);
      
      if (!response.data.success) {
        throw new Error('Error al obtener notificaciones');
      }

      return response.data.data;
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch cada minuto
  });
}

/**
 * Hook para obtener el conteo de notificaciones no leídas
 */
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<number> => {
      const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
      
      if (!response.data.success) {
        throw new Error('Error al obtener conteo de notificaciones');
      }

      return response.data.count;
    },
    staleTime: 15000, // 15 segundos
    refetchInterval: 30000, // Refetch cada 30 segundos
  });
}

/**
 * Hook para marcar una notificación como leída
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number): Promise<void> => {
      const response = await api.patch<MarkReadResponse>(`/notifications/${notificationId}/mark-read`);
      
      if (!response.data.success) {
        throw new Error('Error al marcar notificación como leída');
      }
    },
    onSuccess: () => {
      // Invalidar las consultas relacionadas con notificaciones
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await api.patch<MarkReadResponse>('/notifications/mark-all-read');
      
      if (!response.data.success) {
        throw new Error('Error al marcar notificaciones como leídas');
      }
    },
    onSuccess: () => {
      // Invalidar las consultas relacionadas con notificaciones
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook personalizado que combina todas las funcionalidades de notificaciones
 */
export function useNotificationSystem(): {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoadingNotifications: boolean;
  isLoadingCount: boolean;
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  handleMarkAsRead: (notificationId: number) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  markAsRead: ReturnType<typeof useMarkNotificationAsRead>;
  markAllAsRead: ReturnType<typeof useMarkAllNotificationsAsRead>;
} {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notifications = [], isLoading: isLoadingNotifications } = useNotifications(10, false);
  const { data: unreadCount = 0, isLoading: isLoadingCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Función para abrir el panel de notificaciones
  const openNotifications = () => setIsOpen(true);
  
  // Función para cerrar el panel de notificaciones
  const closeNotifications = () => setIsOpen(false);
  
  // Función para marcar una notificación como leída y cerrar el panel
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      // Opcional: cerrar el panel después de marcar como leída
      // closeNotifications();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };
  
  // Función para marcar todas las notificaciones como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  return {
    // Estado
    notifications,
    unreadCount,
    isOpen,
    
    // Estados de carga
    isLoadingNotifications,
    isLoadingCount,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
    
    // Funciones
    openNotifications,
    closeNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    
    // Funciones de mutación directas
    markAsRead,
    markAllAsRead,
  };
} 