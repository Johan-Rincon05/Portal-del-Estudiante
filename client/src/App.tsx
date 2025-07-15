import { Switch, Route } from "wouter";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/student/home-page";
import AdminPage from "@/pages/admin/admin-page";
import AdminRequestsPage from "@/pages/admin/RequestsPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import StudentDetailPage from "@/pages/admin/StudentDetailPage";
import DocumentValidationPage from "@/pages/admin/DocumentValidationPage";
import PaymentValidationPage from "@/pages/admin/PaymentValidationPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import SuperAdminPage from "@/pages/superuser/superadmin-page";
import UserDetailsPage from "@/pages/superuser/UserDetailsPage";
import UserEditPage from "@/pages/superuser/UserEditPage";
import DocumentsPage from "@/pages/student/DocumentsPage";
import RequestsPage from "@/pages/student/RequestsPage";
import ProfilePage from "@/pages/student/ProfilePage";
import PaymentsPage from "@/pages/student/PaymentsPage";
import { RoleBasedRoute } from "@/lib/role-based-route";
import { AuthProvider } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import UsersPage from "@/pages/superuser/UsersPage";

// Componente para redirigir según el rol del usuario
function HomeRedirect() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        setLocation('/admin/reports');
      } else if (user.role === 'estudiante') {
        setLocation('/home');
      } else if (user.role === 'superuser') {
        setLocation('/superadmin');
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  return <div className="text-center mt-10">Redirigiendo...</div>;
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <Switch>
          <Route path="/auth">
            <AuthPage />
          </Route>
          
          <Route path="/">
            <HomeRedirect />
          </Route>

          <Route path="/home">
            <RoleBasedRoute 
              component={HomePage} 
              allowedRoles={['estudiante']} 
            />
          </Route>

          <Route path="/documents">
            <RoleBasedRoute 
              component={DocumentsPage} 
              allowedRoles={['estudiante']} 
            />
          </Route>

          <Route path="/requests">
            <RoleBasedRoute 
              component={RequestsPage} 
              allowedRoles={['estudiante']} 
            />
          </Route>

          <Route path="/payments">
            <RoleBasedRoute 
              component={PaymentsPage} 
              allowedRoles={['estudiante']} 
            />
          </Route>

          <Route path="/profile">
            <RoleBasedRoute 
              component={ProfilePage} 
              allowedRoles={['estudiante']} 
            />
          </Route>

          <Route path="/admin">
            <RoleBasedRoute 
              component={AdminPage} 
              allowedRoles={['admin']} 
            />
          </Route>

          <Route path="/admin/requests">
            <RoleBasedRoute 
              component={AdminRequestsPage} 
              allowedRoles={['admin']} 
            />
          </Route>

          <Route path="/admin/students">
            <RoleBasedRoute 
              component={StudentsPage} 
              allowedRoles={['admin']} 
            />
          </Route>

          <Route path="/admin/students/:id">
            <RoleBasedRoute 
              component={StudentDetailPage} 
              allowedRoles={['admin']} 
            />
          </Route>

          <Route path="/admin/documents/validation">
            <RoleBasedRoute 
              component={DocumentValidationPage} 
              allowedRoles={['admin']} 
            />
          </Route>

          <Route path="/admin/payments/validation">
            <RoleBasedRoute 
              component={PaymentValidationPage} 
              allowedRoles={['admin']} 
            />
          </Route>

          <Route path="/admin/reports">
            <RoleBasedRoute 
              component={ReportsPage} 
              allowedRoles={['admin']} 
            />
          </Route>

          <Route path="/admin/users">
            <RoleBasedRoute 
              component={UsersPage} 
              allowedRoles={['superuser', 'admin']} 
            />
          </Route>

          <Route path="/admin/users/:userId">
            <RoleBasedRoute 
              component={UserDetailsPage} 
              allowedRoles={['superuser', 'admin']} 
            />
          </Route>

          <Route path="/admin/users/:userId/edit">
            <RoleBasedRoute 
              component={UserEditPage} 
              allowedRoles={['superuser', 'admin']} 
            />
          </Route>

          <Route path="/superadmin">
            <RoleBasedRoute 
              component={SuperAdminPage} 
              allowedRoles={['superuser']} 
            />
          </Route>

          <Route>
            <NotFound />
          </Route>
        </Switch>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
