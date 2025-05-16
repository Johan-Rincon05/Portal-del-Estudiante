import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ComponentType } from "react";

interface RoleBasedRouteProps {
  component: ComponentType;
  allowedRoles: string[];
}

export function RoleBasedRoute({ component: Component, allowedRoles }: RoleBasedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    setTimeout(() => {
      if (user) {
        switch (user.role) {
          case 'admin':
            setLocation('/admin');
            break;
          case 'superuser':
            setLocation('/superadmin');
            break;
          case 'estudiante':
            setLocation('/');
            break;
          default:
            setLocation('/auth');
        }
      } else {
        setLocation('/auth');
      }
    }, 0);
    return <div className="text-center mt-10 text-red-600">No autorizado o sesión expirada. Redirigiendo...</div>;
  }

  return <Component />;
} 