import { Switch, Route } from "wouter";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/student/home-page";
import AdminPage from "@/pages/admin/admin-page";
import AdminRequestsPage from "@/pages/admin/RequestsPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import SuperAdminPage from "@/pages/superuser/superadmin-page";
import DocumentsPage from "@/pages/student/DocumentsPage";
import RequestsPage from "@/pages/student/RequestsPage";
import ProfilePage from "@/pages/student/ProfilePage";
import PaymentsPage from "@/pages/student/PaymentsPage";
import { RoleBasedRoute } from "@/lib/role-based-route";
import { AuthProvider } from "@/hooks/use-auth";
import UsersPage from "@/pages/superuser/UsersPage";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/auth">
            <AuthPage />
          </Route>
          
          <Route path="/">
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

          <Route path="/admin/users">
            <RoleBasedRoute 
              component={UsersPage} 
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
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
