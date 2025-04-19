import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { UserRole } from "@shared/schema";
import { Layout } from "@/components/layout";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles: UserRole[];
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

  if (!allowedRoles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">
              No tienes los permisos necesarios para acceder a esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-700"
            >
              Volver
            </button>
          </div>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Layout>
        <Component />
      </Layout>
    </Route>
  );
}
