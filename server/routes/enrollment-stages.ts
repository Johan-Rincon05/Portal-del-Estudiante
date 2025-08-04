import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { getWebSocketManager } from '../utils/websocket';
import { sendStatusChangeEmail } from '../utils/email';

const router = Router();

// Esquemas de validación
const changeStageSchema = z.object({
  studentId: z.number(),
  newStage: z.enum(['Inscripción', 'Documentación', 'Pago', 'Matriculado', 'En Curso', 'Graduado', 'Retirado']),
  reason: z.string().min(1, 'Debe proporcionar un motivo'),
  comments: z.string().optional(),
  adminComments: z.string().optional(),
  forceChange: z.boolean().optional() // Para cambios forzados que no cumplen requisitos
});

const getStudentStagesSchema = z.object({
  studentId: z.number().optional(),
  stage: z.string().optional(),
  status: z.enum(['todos', 'activo', 'inactivo']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});

const getStageHistorySchema = z.object({
  studentId: z.number()
});

const getStageRequirementsSchema = z.object({
  stage: z.string()
});

// Definir requisitos para cada etapa
const STAGE_REQUIREMENTS = {
  'Inscripción': {
    required: ['basic_info'],
    optional: ['contact_info']
  },
  'Documentación': {
    required: ['dni', 'certificado_estudios'],
    optional: ['foto_carnet', 'certificado_medico']
  },
  'Pago': {
    required: ['comprobante_pago'],
    optional: ['otros_documentos']
  },
  'Matriculado': {
    required: ['all_documents_approved', 'payment_confirmed'],
    optional: ['additional_requirements']
  },
  'En Curso': {
    required: ['matriculado'],
    optional: ['course_selection']
  },
  'Graduado': {
    required: ['all_courses_completed', 'thesis_approved'],
    optional: ['graduation_ceremony']
  },
  'Retirado': {
    required: ['withdrawal_request'],
    optional: ['exit_interview']
  }
};

// Obtener estudiantes con sus etapas actuales
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const query = getStudentStagesSchema.parse(req.query);
    
    const students = await storage.getStudentsWithStages({
      studentId: query.studentId,
      stage: query.stage,
      status: query.status === 'todos' ? undefined : query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page: query.page || 1,
      limit: query.limit || 20
    });

    res.json(students);
  } catch (error) {
    console.error('Error getting students with stages:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de etapas
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const stats = await storage.getEnrollmentStageStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting enrollment stage stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar etapa de un estudiante
router.post('/change-stage', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { studentId, newStage, reason, comments, adminComments, forceChange } = changeStageSchema.parse(req.body);

    // Obtener información del estudiante
    const student = await storage.getUserById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const currentStage = student.currentStage || 'Inscripción';

    // Verificar si el cambio es válido
    if (!forceChange) {
      const validationResult = await validateStageChange(studentId, currentStage, newStage);
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'No se pueden cumplir los requisitos para el cambio de etapa',
          details: validationResult.missingRequirements,
          canForce: true
        });
      }
    }

    // Obtener información completa del estudiante para validaciones
    const studentInfo = await storage.getStudentCompleteInfo(studentId);
    
    // Validaciones específicas por etapa
    const stageValidation = await validateSpecificStageRequirements(newStage, studentInfo);
    if (!stageValidation.isValid && !forceChange) {
      return res.status(400).json({
        error: 'No se cumplen los requisitos específicos de la etapa',
        details: stageValidation.missingRequirements,
        canForce: true
      });
    }

    // Actualizar la etapa del estudiante
    const updatedStudent = await storage.updateUser(studentId, {
      currentStage: newStage,
      updatedAt: new Date().toISOString()
    });

    // Crear registro en el historial de cambios de etapa
    const stageChange = await storage.createEnrollmentStageChange({
      studentId,
      fromStage: currentStage,
      toStage: newStage,
      reason,
      comments,
      adminComments,
      changedBy: user.id,
      changedAt: new Date().toISOString(),
      isApproved: true,
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
      forceChange: forceChange || false
    });

    // Crear comentario en el sistema de comentarios
    await storage.createStudentComment({
      studentId,
      author: user.username,
      content: `Cambio de etapa: ${currentStage} → ${newStage}. Motivo: ${reason}${comments ? `. Comentarios: ${comments}` : ''}`,
      type: 'stage_change',
      createdAt: new Date().toISOString()
    });

    // Enviar notificación WebSocket al estudiante
    const wsManager = getWebSocketManager();
    wsManager.sendNotificationToUser(studentId, {
      type: 'stage_change',
      title: 'Cambio de Etapa',
      message: `Tu etapa ha cambiado de ${currentStage} a ${newStage}`,
      priority: 'high',
      data: {
        fromStage: currentStage,
        toStage: newStage,
        reason
      }
    });

    // Enviar email de notificación al estudiante
    try {
      await sendStatusChangeEmail(
        student.email,
        student.username,
        'stage_change',
        newStage,
        `Tu etapa de matrícula ha cambiado de ${currentStage} a ${newStage}. Motivo: ${reason}`
      );
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // No fallar la operación si el email falla
    }

    // Notificar a administradores sobre el cambio
    wsManager.sendNotificationToAdmins({
      type: 'stage_change_admin',
      title: 'Cambio de Etapa Realizado',
      message: `${student.username} cambió de ${currentStage} a ${newStage}`,
      priority: 'medium',
      data: {
        studentId,
        studentName: student.username,
        fromStage: currentStage,
        toStage: newStage,
        changedBy: user.username
      }
    });

    res.json({
      message: 'Etapa cambiada exitosamente',
      student: updatedStudent,
      stageChange
    });

  } catch (error) {
    console.error('Error changing student stage:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos de cambio de etapa inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener historial de cambios de etapa de un estudiante
router.get('/history/:studentId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { studentId } = getStageHistorySchema.parse({ studentId: parseInt(req.params.studentId) });
    
    const history = await storage.getEnrollmentStageHistory(studentId);
    res.json(history);
  } catch (error) {
    console.error('Error getting stage history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener requisitos de una etapa específica
router.get('/requirements/:stage', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { stage } = getStageRequirementsSchema.parse({ stage: req.params.stage });
    
    const requirements = STAGE_REQUIREMENTS[stage as keyof typeof STAGE_REQUIREMENTS] || {
      required: [],
      optional: []
    };

    res.json({
      stage,
      requirements,
      description: getStageDescription(stage)
    });
  } catch (error) {
    console.error('Error getting stage requirements:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validar requisitos de cambio de etapa para un estudiante
router.post('/validate-change/:studentId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const studentId = parseInt(req.params.studentId);
    const { targetStage } = req.body;

    if (!targetStage) {
      return res.status(400).json({ error: 'Debe especificar la etapa objetivo' });
    }

    // Obtener información del estudiante
    const student = await storage.getUserById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const currentStage = student.currentStage || 'Inscripción';

    // Validar el cambio de etapa
    const validationResult = await validateStageChange(studentId, currentStage, targetStage);
    
    // Obtener información completa del estudiante
    const studentInfo = await storage.getStudentCompleteInfo(studentId);
    const stageValidation = await validateSpecificStageRequirements(targetStage, studentInfo);

    res.json({
      currentStage,
      targetStage,
      canChange: validationResult.isValid && stageValidation.isValid,
      missingRequirements: {
        general: validationResult.missingRequirements,
        specific: stageValidation.missingRequirements
      },
      recommendations: getStageChangeRecommendations(currentStage, targetStage)
    });

  } catch (error) {
    console.error('Error validating stage change:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener información completa de un estudiante para gestión de etapas
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const studentId = parseInt(req.params.studentId);
    
    const studentInfo = await storage.getStudentCompleteInfo(studentId);
    if (!studentInfo) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Obtener historial de cambios de etapa
    const stageHistory = await storage.getEnrollmentStageHistory(studentId);
    
    // Obtener comentarios del estudiante
    const comments = await storage.getStudentComments(studentId);

    res.json({
      student: studentInfo,
      stageHistory,
      comments,
      currentRequirements: await getCurrentStageRequirements(studentInfo.currentStage, studentInfo)
    });

  } catch (error) {
    console.error('Error getting student info for stage management:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Funciones auxiliares
async function validateStageChange(studentId: number, currentStage: string, targetStage: string) {
  const stageOrder = ['Inscripción', 'Documentación', 'Pago', 'Matriculado', 'En Curso', 'Graduado', 'Retirado'];
  const currentIndex = stageOrder.indexOf(currentStage);
  const targetIndex = stageOrder.indexOf(targetStage);

  // Permitir retroceder etapas (para correcciones)
  if (targetIndex < currentIndex) {
    return { isValid: true, missingRequirements: [] };
  }

  // Verificar requisitos de etapas intermedias
  const missingRequirements = [];
  
  for (let i = currentIndex + 1; i <= targetIndex; i++) {
    const intermediateStage = stageOrder[i];
    const requirements = STAGE_REQUIREMENTS[intermediateStage as keyof typeof STAGE_REQUIREMENTS];
    
    if (requirements) {
      // Verificar documentos requeridos
      const documents = await storage.getUserDocuments(studentId);
      const requiredDocs = requirements.required;
      
      for (const requiredDoc of requiredDocs) {
        const hasDoc = documents.some(doc => doc.type === requiredDoc && doc.status === 'aprobado');
        if (!hasDoc) {
          missingRequirements.push(`${intermediateStage}: ${requiredDoc} aprobado`);
        }
      }
    }
  }

  return {
    isValid: missingRequirements.length === 0,
    missingRequirements
  };
}

async function validateSpecificStageRequirements(stage: string, studentInfo: any) {
  const missingRequirements = [];

  switch (stage) {
    case 'Matriculado':
      // Verificar que todos los documentos estén aprobados
      if (studentInfo.documents) {
        const pendingDocs = studentInfo.documents.filter((doc: any) => doc.status !== 'aprobado');
        if (pendingDocs.length > 0) {
          missingRequirements.push('Todos los documentos deben estar aprobados');
        }
      }
      
      // Verificar que el pago esté confirmado
      if (studentInfo.payments) {
        const pendingPayments = studentInfo.payments.filter((payment: any) => payment.status !== 'aprobado');
        if (pendingPayments.length > 0) {
          missingRequirements.push('Todos los pagos deben estar aprobados');
        }
      }
      break;

    case 'En Curso':
      if (studentInfo.currentStage !== 'Matriculado') {
        missingRequirements.push('Debe estar matriculado para comenzar cursos');
      }
      break;

    case 'Graduado':
      // Verificar que todos los cursos estén completados
      if (studentInfo.courses) {
        const incompleteCourses = studentInfo.courses.filter((course: any) => course.status !== 'completado');
        if (incompleteCourses.length > 0) {
          missingRequirements.push('Todos los cursos deben estar completados');
        }
      }
      break;
  }

  return {
    isValid: missingRequirements.length === 0,
    missingRequirements
  };
}

function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    'Inscripción': 'Proceso inicial de registro en el sistema',
    'Documentación': 'Entrega y validación de documentos requeridos',
    'Pago': 'Confirmación de pagos y cuotas',
    'Matriculado': 'Estudiante completamente registrado y activo',
    'En Curso': 'Estudiante cursando materias activamente',
    'Graduado': 'Estudiante que ha completado todos los requisitos',
    'Retirado': 'Estudiante que ha abandonado el programa'
  };
  return descriptions[stage] || 'Descripción no disponible';
}

function getStageChangeRecommendations(currentStage: string, targetStage: string): string[] {
  const recommendations = [];
  
  if (targetStage === 'Documentación' && currentStage === 'Inscripción') {
    recommendations.push('Verificar que el estudiante haya completado el formulario de inscripción');
    recommendations.push('Solicitar DNI y certificado de estudios');
  }
  
  if (targetStage === 'Pago' && currentStage === 'Documentación') {
    recommendations.push('Verificar que todos los documentos estén aprobados');
    recommendations.push('Solicitar comprobante de pago');
  }
  
  if (targetStage === 'Matriculado' && currentStage === 'Pago') {
    recommendations.push('Confirmar que el pago esté aprobado');
    recommendations.push('Verificar que todos los documentos estén aprobados');
  }

  return recommendations;
}

async function getCurrentStageRequirements(currentStage: string, studentInfo: any) {
  const requirements = STAGE_REQUIREMENTS[currentStage as keyof typeof STAGE_REQUIREMENTS];
  if (!requirements) return { required: [], optional: [] };

  const currentRequirements = {
    required: [] as any[],
    optional: [] as any[]
  };

  // Verificar documentos requeridos
  if (studentInfo.documents) {
    for (const requiredDoc of requirements.required) {
      const doc = studentInfo.documents.find((d: any) => d.type === requiredDoc);
      currentRequirements.required.push({
        type: requiredDoc,
        status: doc ? doc.status : 'pendiente',
        uploaded: !!doc
      });
    }

    for (const optionalDoc of requirements.optional) {
      const doc = studentInfo.documents.find((d: any) => d.type === optionalDoc);
      currentRequirements.optional.push({
        type: optionalDoc,
        status: doc ? doc.status : 'no_subido',
        uploaded: !!doc
      });
    }
  }

  return currentRequirements;
}

export default router; 