/**
 * Rutas para el manejo de pagos y cuotas
 * Este archivo contiene los endpoints para consultar el estado financiero del estudiante
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

/**
 * Obtiene el historial de pagos del estudiante autenticado
 * GET /api/payments/me
 * @requires Token JWT en el header de autorización
 * @returns Lista de pagos realizados por el estudiante
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const payments = await storage.getPaymentsByUserId(userId);
    
    res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtiene las cuotas pendientes del estudiante autenticado
 * GET /api/payments/installments/me
 * @requires Token JWT en el header de autorización
 * @returns Lista de cuotas pendientes del estudiante
 */
router.get('/installments/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const installments = await storage.getInstallmentsByUserId(userId);
    
    res.json(installments);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtiene el resumen financiero del estudiante
 * GET /api/payments/summary
 * @requires Token JWT en el header de autorización
 * @returns Resumen con totales de pagos y cuotas pendientes
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Obtener pagos realizados
    const payments = await storage.getPaymentsByUserId(userId);
    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    
    // Obtener cuotas pendientes
    const installments = await storage.getInstallmentsByUserId(userId);
    const totalPending = installments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    
    // Obtener cuotas pagadas
    const paidInstallments = installments.filter(installment => installment.status === 'pagada');
    const totalPaidInstallments = paidInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    
    // Obtener cuotas vencidas
    const overdueInstallments = installments.filter(installment => {
      if (installment.status === 'pendiente' && installment.dueDate) {
        return new Date(installment.dueDate) < new Date();
      }
      return false;
    });
    
    const summary = {
      totalPaid,
      totalPending,
      totalPaidInstallments,
      overdueCount: overdueInstallments.length,
      totalOverdue: overdueInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0),
      paymentsCount: payments.length,
      installmentsCount: installments.length
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 