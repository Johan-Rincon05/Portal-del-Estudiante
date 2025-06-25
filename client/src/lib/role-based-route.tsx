import { useAuth } from "@/hooks/use-auth";
import { ComponentType } from "react";

interface RoleBasedRouteProps {
  component: ComponentType;
  allowedRoles: string[];
}

export function RoleBasedRoute({ component: Component, allowedRoles }: RoleBasedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <div className="text-center mt-10 text-red-600">No autorizado o sesión expirada. Redirigiendo...</div>;
  }

  return <Component />;
} 