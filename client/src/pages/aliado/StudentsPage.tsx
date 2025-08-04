// Reutilizamos la página de estudiantes existente pero con el nuevo layout
import StudentsContent from '@/pages/admin/StudentsPage';
import { AliadoLayout } from '@/components/layouts/AliadoLayout';

export default function AliadoStudentsPage() {
  return (
    <AliadoLayout>
      <StudentsContent />
    </AliadoLayout>
  );
}