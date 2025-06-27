/**
 * Utilidades para el manejo de notificaciones
 * Funciones para crear notificaciones automáticamente en diferentes eventos del sistema
 */

import { db } from '../db.js';
import { notifications } from '../../shared/schema.js';
import { InsertNotification } from '../../shared/schema.js';

/**
 * Crea una notificación para un usuario específico
 * @param notificationData - Datos de la notificación a crear
 * @returns La notificación creada
 */
export async function createNotification(notificationData: InsertNotification) {
  try {
    const [newNotification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();

    return newNotification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
}

/**
 * Crea una notificación cuando se sube un documento
 * @param userId - ID del usuario que subió el documento
 * @param documentName - Nombre del documento subido
 * @param documentType - Tipo del documento
 */
export async function createDocumentUploadNotification(
  userId: number,
  documentName: string,
  documentType: string
) {
  const notificationData: InsertNotification = {
    userId,
    title: 'Documento Subido',
    body: `Has subido exitosamente el documento "${documentName}" (${documentType}). Será revisado por el administrador.`,
    type: 'document',
    link: '/documents'
  };

  return createNotification(notificationData);
}

/**
 * Crea una notificación cuando se aprueba un documento
 * @param userId - ID del usuario propietario del documento
 * @param documentName - Nombre del documento aprobado
 */
export async function createDocumentApprovedNotification(
  userId: number,
  documentName: string
) {
  const notificationData: InsertNotification = {
    userId,
    title: 'Documento Aprobado',
    body: `Tu documento "${documentName}" ha sido aprobado por el administrador.`,
    type: 'document',
    link: '/documents'
  };

  return createNotification(notificationData);
}

/**
 * Crea una notificación cuando se rechaza un documento
 * @param userId - ID del usuario propietario del documento
 * @param documentName - Nombre del documento rechazado
 * @param rejectionReason - Motivo del rechazo
 */
export async function createDocumentRejectedNotification(
  userId: number,
  documentName: string,
  rejectionReason: string
) {
  const notificationData: InsertNotification = {
    userId,
    title: 'Documento Rechazado',
    body: `Tu documento "${documentName}" ha sido rechazado. Motivo: ${rejectionReason}`,
    type: 'document',
    link: '/documents'
  };

  return createNotification(notificationData);
}

/**
 * Crea una notificación cuando se envía una solicitud
 * @param userId - ID del usuario que envió la solicitud
 * @param subject - Asunto de la solicitud
 */
export async function createRequestSubmittedNotification(
  userId: number,
  subject: string
) {
  const notificationData: InsertNotification = {
    userId,
    title: 'Solicitud Enviada',
    body: `Tu solicitud "${subject}" ha sido enviada exitosamente. Recibirás una respuesta pronto.`,
    type: 'request',
    link: '/requests'
  };

  return createNotification(notificationData);
}

/**
 * Crea una notificación cuando se responde una solicitud
 * @param userId - ID del usuario que envió la solicitud
 * @param subject - Asunto de la solicitud
 * @param status - Estado de la solicitud
 */
export async function createRequestResponseNotification(
  userId: number,
  subject: string,
  status: string
) {
  const notificationData: InsertNotification = {
    userId,
    title: 'Respuesta a Solicitud',
    body: `Tu solicitud "${subject}" ha sido ${status}. Revisa los detalles en la sección de solicitudes.`,
    type: 'request',
    link: '/requests'
  };

  return createNotification(notificationData);
}

/**
 * Crea una notificación cuando cambia la etapa de matrícula
 * @param userId - ID del usuario
 * @param newStage - Nueva etapa de matrícula
 */
export async function createEnrollmentStageNotification(
  userId: number,
  newStage: string
) {
  const stageNames: Record<string, string> = {
    'suscrito': 'Suscrito',
    'documentos_completos': 'Documentos Completos',
    'registro_validado': 'Registro Validado',
    'proceso_universitario': 'Proceso Universitario',
    'matriculado': 'Matriculado',
    'inicio_clases': 'Inicio de Clases',
    'estudiante_activo': 'Estudiante Activo',
    'pagos_al_dia': 'Pagos al Día',
    'proceso_finalizado': 'Proceso Finalizado'
  };

  const stageName = stageNames[newStage] || newStage;

  const notificationData: InsertNotification = {
    userId,
    title: 'Progreso en Matrícula',
    body: `Has avanzado a la etapa "${stageName}". ¡Felicidades por tu progreso!`,
    type: 'stage',
    link: '/'
  };

  return createNotification(notificationData);
}

/**
 * Crea una notificación para administradores cuando se sube un documento
 * @param adminUserIds - Array de IDs de usuarios administradores
 * @param studentName - Nombre del estudiante que subió el documento
 * @param documentName - Nombre del documento
 */
export async function createAdminDocumentUploadNotification(
  adminUserIds: number[],
  studentName: string,
  documentName: string
) {
  const notifications = adminUserIds.map(adminId => ({
    userId: adminId,
    title: 'Nuevo Documento Pendiente',
    body: `El estudiante ${studentName} ha subido el documento "${documentName}" y requiere revisión.`,
    type: 'document',
    link: '/admin/students'
  }));

  // Crear todas las notificaciones en paralelo
  return Promise.all(notifications.map(createNotification));
}

/**
 * Crea una notificación para administradores cuando se envía una solicitud
 * @param adminUserIds - Array de IDs de usuarios administradores
 * @param studentName - Nombre del estudiante que envió la solicitud
 * @param subject - Asunto de la solicitud
 */
export async function createAdminRequestNotification(
  adminUserIds: number[],
  studentName: string,
  subject: string
) {
  const notifications = adminUserIds.map(adminId => ({
    userId: adminId,
    title: 'Nueva Solicitud de Estudiante',
    body: `El estudiante ${studentName} ha enviado una solicitud: "${subject}".`,
    type: 'request',
    link: '/admin/requests'
  }));

  // Crear todas las notificaciones en paralelo
  return Promise.all(notifications.map(createNotification));
} 