// Reutilizamos la página de validación de pagos existente pero con el nuevo layout
import PaymentValidationContent from '@/pages/admin/PaymentValidationPage';
import { CarteraLayout } from '@/components/layouts/CarteraLayout';

export default function CarteraPaymentValidationPage() {
  return (
    <CarteraLayout>
      <PaymentValidationContent />
    </CarteraLayout>
  );
}