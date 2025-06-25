import { useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirigir a la página de solicitudes por defecto
    setLocation("/admin/requests");
  }, [setLocation]);

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido al Panel de Administración</CardTitle>
            <CardDescription>
              Estás siendo redirigido a la gestión de solicitudes...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Si no eres redirigido automáticamente, haz clic en "Solicitudes" en la barra de navegación.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 