import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  roles = [],
}: {
  path: string;
  component: React.ComponentType;
  roles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Verificar si el usuario tiene el rol necesario para acceder
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-2xl font-bold">Acceso denegado</h1>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta página</p>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}