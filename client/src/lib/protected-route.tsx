import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.user_metadata?.role;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to most permissive route they have access to
    if (userRole === 'estudiante') {
      return <Navigate to="/profile" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/students" replace />;
    } else if (userRole === 'superuser') {
      return <Navigate to="/admin/users" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
