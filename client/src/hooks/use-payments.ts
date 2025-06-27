/**
 * Hook personalizado para manejar pagos y cuotas
 * Proporciona funciones para consultar el estado financiero del estudiante
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Hook para obtener el historial de pagos del estudiante
 */
export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await api.get('/api/payments/me');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener las cuotas del estudiante
 */
export const useInstallments = () => {
  return useQuery({
    queryKey: ['installments'],
    queryFn: async () => {
      const response = await api.get('/api/payments/installments/me');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener el resumen financiero del estudiante
 */
export const usePaymentSummary = () => {
  return useQuery({
    queryKey: ['payment-summary'],
    queryFn: async () => {
      const response = await api.get('/api/payments/summary');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
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