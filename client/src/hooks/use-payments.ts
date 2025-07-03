/**
 * Hook personalizado para manejar pagos y cuotas
 * Proporciona funciones para consultar el estado financiero del estudiante
 */

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';

/**
 * Hook para obtener el historial de pagos del estudiante
 */
export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await apiRequest('/api/payments/me');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar en errores de autenticación
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook para obtener todos los pagos (sin filtro de usuario) - Para páginas de administrador
 */
export const useAllPayments = () => {
  return useQuery({
    queryKey: ['payments', 'all'],
    queryFn: async () => {
      const response = await apiRequest('/api/payments');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar en errores de autenticación
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook para obtener las cuotas del estudiante
 */
export const useInstallments = () => {
  return useQuery({
    queryKey: ['installments'],
    queryFn: async () => {
      const response = await apiRequest('/api/payments/installments/me');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar en errores de autenticación
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook para obtener el resumen financiero del estudiante
 */
export const usePaymentSummary = () => {
  return useQuery({
    queryKey: ['payment-summary'],
    queryFn: async () => {
      const response = await apiRequest('/api/payments/summary');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar en errores de autenticación
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Tipos para los datos de pagos
 */
export interface Payment {
  id: number;
  userId: number;
  paymentDate: string;
  paymentMethod: string;
  amount: number;
  giftReceived: boolean;
  documentsStatus: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tipos para los datos de cuotas
 */
export interface Installment {
  id: number;
  userId: number;
  installmentNumber: number;
  amount: number;
  support: string;
  status?: string;
  dueDate?: string;
  createdAt: string;
}

/**
 * Tipos para el resumen financiero
 */
export interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalPaidInstallments: number;
  overdueCount: number;
  totalOverdue: number;
  paymentsCount: number;
  installmentsCount: number;
} 