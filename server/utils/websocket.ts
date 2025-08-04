import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Tipos para las notificaciones
export interface NotificationData {
  id: string;
  type: 'document' | 'request' | 'payment' | 'system';
  title: string;
  message: string;
  userId: number;
  data?: any;
  createdAt: Date;
  read: boolean;
}

export interface WebSocketMessage {
  type: 'notification' | 'status_update' | 'document_update' | 'request_update' | 'payment_update';
  data: any;
  timestamp: Date;
}

// Mapa para almacenar las conexiones de usuarios
const userConnections = new Map<number, string[]>();

// Clase para manejar WebSockets
export class WebSocketManager {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: config.websocket.cors,
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Configurar middleware de autenticación
  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Token no proporcionado'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { id: number; role: string };
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Token inválido'));
      }
    });
  }

  // Configurar manejadores de eventos
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.user.id;
      const userRole = socket.data.user.role;

      console.log(`🔌 Usuario ${userId} (${userRole}) conectado al WebSocket`);

      // Agregar conexión al mapa
      if (!userConnections.has(userId)) {
        userConnections.set(userId, []);
      }
      userConnections.get(userId)!.push(socket.id);

      // Unirse a salas específicas según el rol
      socket.join(`user:${userId}`);
      if (userRole === 'SuperAdministrativos' || userRole === 'superuser') {
        socket.join('admin');
      }
      if (userRole === 'superuser') {
        socket.join('superuser');
      }

      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log(`🔌 Usuario ${userId} desconectado del WebSocket`);
        
        // Remover conexión del mapa
        const connections = userConnections.get(userId);
        if (connections) {
          const index = connections.indexOf(socket.id);
          if (index > -1) {
            connections.splice(index, 1);
          }
          if (connections.length === 0) {
            userConnections.delete(userId);
          }
        }
      });

      // Manejar marcado de notificación como leída
      socket.on('mark_notification_read', (notificationId: string) => {
        this.markNotificationAsRead(userId, notificationId);
      });

      // Manejar marcado de todas las notificaciones como leídas
      socket.on('mark_all_notifications_read', () => {
        this.markAllNotificationsAsRead(userId);
      });

      // Manejar solicitud de notificaciones no leídas
      socket.on('get_unread_notifications', () => {
        this.sendUnreadNotifications(userId);
      });
    });
  }

  // Enviar notificación a un usuario específico
  public sendNotificationToUser(userId: number, notification: NotificationData) {
    const connections = userConnections.get(userId);
    
    if (connections && connections.length > 0) {
      const message: WebSocketMessage = {
        type: 'notification',
        data: notification,
        timestamp: new Date()
      };

      connections.forEach(socketId => {
        this.io.to(socketId).emit('notification', message);
      });

      console.log(`📢 Notificación enviada al usuario ${userId}: ${notification.title}`);
    }
  }

  // Enviar notificación a todos los administradores
  public sendNotificationToAdmins(notification: NotificationData) {
    const message: WebSocketMessage = {
      type: 'notification',
      data: notification,
      timestamp: new Date()
    };

    this.io.to('admin').emit('notification', message);
    console.log(`📢 Notificación enviada a administradores: ${notification.title}`);
  }

  // Enviar notificación a superusuarios
  public sendNotificationToSuperUsers(notification: NotificationData) {
    const message: WebSocketMessage = {
      type: 'notification',
      data: notification,
      timestamp: new Date()
    };

    this.io.to('superuser').emit('notification', message);
    console.log(`📢 Notificación enviada a superusuarios: ${notification.title}`);
  }

  // Enviar actualización de estado de documento
  public sendDocumentStatusUpdate(userId: number, documentData: any) {
    const connections = userConnections.get(userId);
    
    if (connections && connections.length > 0) {
      const message: WebSocketMessage = {
        type: 'document_update',
        data: documentData,
        timestamp: new Date()
      };

      connections.forEach(socketId => {
        this.io.to(socketId).emit('document_update', message);
      });

      console.log(`📄 Actualización de documento enviada al usuario ${userId}`);
    }
  }

  // Enviar actualización de estado de solicitud
  public sendRequestStatusUpdate(userId: number, requestData: any) {
    const connections = userConnections.get(userId);
    
    if (connections && connections.length > 0) {
      const message: WebSocketMessage = {
        type: 'request_update',
        data: requestData,
        timestamp: new Date()
      };

      connections.forEach(socketId => {
        this.io.to(socketId).emit('request_update', message);
      });

      console.log(`📝 Actualización de solicitud enviada al usuario ${userId}`);
    }
  }

  // Enviar actualización de estado de pago
  public sendPaymentStatusUpdate(userId: number, paymentData: any) {
    const connections = userConnections.get(userId);
    
    if (connections && connections.length > 0) {
      const message: WebSocketMessage = {
        type: 'payment_update',
        data: paymentData,
        timestamp: new Date()
      };

      connections.forEach(socketId => {
        this.io.to(socketId).emit('payment_update', message);
      });

      console.log(`💰 Actualización de pago enviada al usuario ${userId}`);
    }
  }

  // Enviar notificaciones no leídas
  private async sendUnreadNotifications(userId: number) {
    try {
      // TODO: Implementar obtención de notificaciones no leídas desde la base de datos
      const unreadNotifications: NotificationData[] = [];
      
      const connections = userConnections.get(userId);
      if (connections && connections.length > 0) {
        connections.forEach(socketId => {
          this.io.to(socketId).emit('unread_notifications', unreadNotifications);
        });
      }
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
    }
  }

  // Marcar notificación como leída
  private async markNotificationAsRead(userId: number, notificationId: string) {
    try {
      // TODO: Implementar marcado de notificación como leída en la base de datos
      console.log(`✅ Notificación ${notificationId} marcada como leída por usuario ${userId}`);
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  }

  // Marcar todas las notificaciones como leídas
  private async markAllNotificationsAsRead(userId: number) {
    try {
      // TODO: Implementar marcado de todas las notificaciones como leídas en la base de datos
      console.log(`✅ Todas las notificaciones marcadas como leídas por usuario ${userId}`);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  }

  // Obtener estadísticas de conexiones
  public getConnectionStats() {
    return {
      totalConnections: userConnections.size,
      totalSockets: Array.from(userConnections.values()).reduce((acc, connections) => acc + connections.length, 0),
      connectedUsers: Array.from(userConnections.keys())
    };
  }

  // Enviar mensaje de prueba
  public sendTestMessage(userId: number, message: string) {
    const testNotification: NotificationData = {
      id: `test-${Date.now()}`,
      type: 'system',
      title: 'Mensaje de Prueba',
      message,
      userId,
      createdAt: new Date(),
      read: false
    };

    this.sendNotificationToUser(userId, testNotification);
  }

  // Broadcast a todos los usuarios conectados
  public broadcastToAll(message: WebSocketMessage) {
    this.io.emit('broadcast', message);
    console.log(`📢 Broadcast enviado a todos los usuarios: ${message.type}`);
  }
}

// Instancia global del WebSocket Manager
let wsManager: WebSocketManager | null = null;

// Función para inicializar WebSocket Manager
export const initializeWebSocket = (server: HTTPServer): WebSocketManager => {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
    console.log('🚀 WebSocket Manager inicializado');
  }
  return wsManager;
};

// Función para obtener la instancia del WebSocket Manager
export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManager) {
    throw new Error('WebSocket Manager no inicializado. Llama a initializeWebSocket primero.');
  }
  return wsManager;
};

// Funciones de utilidad para enviar notificaciones
export const sendDocumentRejectionNotification = (userId: number, documentName: string, reason: string) => {
  const ws = getWebSocketManager();
  const notification: NotificationData = {
    id: `doc-reject-${Date.now()}`,
    type: 'document',
    title: 'Documento Rechazado',
    message: `Tu documento "${documentName}" ha sido rechazado. Motivo: ${reason}`,
    userId,
    data: { documentName, reason },
    createdAt: new Date(),
    read: false
  };

  ws.sendNotificationToUser(userId, notification);
};

export const sendDocumentApprovalNotification = (userId: number, documentName: string) => {
  const ws = getWebSocketManager();
  const notification: NotificationData = {
    id: `doc-approve-${Date.now()}`,
    type: 'document',
    title: 'Documento Aprobado',
    message: `Tu documento "${documentName}" ha sido aprobado exitosamente.`,
    userId,
    data: { documentName },
    createdAt: new Date(),
    read: false
  };

  ws.sendNotificationToUser(userId, notification);
};

export const sendRequestUpdateNotification = (userId: number, requestTitle: string, status: string) => {
  const ws = getWebSocketManager();
  const notification: NotificationData = {
    id: `req-update-${Date.now()}`,
    type: 'request',
    title: 'Solicitud Actualizada',
    message: `Tu solicitud "${requestTitle}" ha cambiado de estado a: ${status}`,
    userId,
    data: { requestTitle, status },
    createdAt: new Date(),
    read: false
  };

  ws.sendNotificationToUser(userId, notification);
};

export const sendPaymentReminderNotification = (userId: number, amount: number, dueDate: string) => {
  const ws = getWebSocketManager();
  const notification: NotificationData = {
    id: `pay-reminder-${Date.now()}`,
    type: 'payment',
    title: 'Recordatorio de Pago',
    message: `Tienes un pago pendiente de $${amount} que vence el ${dueDate}.`,
    userId,
    data: { amount, dueDate },
    createdAt: new Date(),
    read: false
  };

  ws.sendNotificationToUser(userId, notification);
}; 