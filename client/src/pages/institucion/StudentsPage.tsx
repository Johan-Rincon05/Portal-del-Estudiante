// Reutilizamos la página de estudiantes existente pero con el nuevo layout
import StudentsContent from '@/pages/admin/StudentsPage';
import { InstitucionLayout } from '@/components/layouts/InstitucionLayout';

export default function InstitucionStudentsPage() {
  return (
    <InstitucionLayout>
      <StudentsContent />
    </InstitucionLayout>
  );
}