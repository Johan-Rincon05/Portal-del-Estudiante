// Reutilizamos la página de solicitudes existente pero con el nuevo layout
import RequestsContent from '@/pages/admin/RequestsPage';
import { InstitucionLayout } from '@/components/layouts/InstitucionLayout';

export default function InstitucionRequestsPage() {
  return (
    <InstitucionLayout>
      <RequestsContent />
    </InstitucionLayout>
  );
}