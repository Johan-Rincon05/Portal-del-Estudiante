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
    return <div>Cargando...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Si el usuario no tiene el rol adecuado, redirigir a su página correspondiente
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
    return null;
  }

  return <Component />;
} 