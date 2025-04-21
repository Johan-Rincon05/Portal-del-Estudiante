import { Switch, Route } from "wouter";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AdminPage from "@/pages/admin-page";
import AdminRequestsPage from "@/pages/admin/requests-page";
import StudentsPage from "@/pages/admin/students-page";
import SuperAdminPage from "@/pages/superadmin-page";
import DocumentsPage from "@/pages/documents-page";
import RequestsPage from "@/pages/requests-page";
import ProfilePage from "@/pages/profile-page";
import { RoleBasedRoute } from "@/lib/role-based-route";
import { AuthProvider } from "@/hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/auth" component={AuthPage} />
          
          <Route path="/">
            {() => (
              <RoleBasedRoute 
                component={HomePage} 
                allowedRoles={['estudiante']} 
              />
            )}
          </Route>

          <Route path="/documents">
            {() => (
              <RoleBasedRoute 
                component={DocumentsPage} 
                allowedRoles={['estudiante']} 
              />
            )}
          </Route>

          <Route path="/requests">
            {() => (
              <RoleBasedRoute 
                component={RequestsPage} 
                allowedRoles={['estudiante']} 
              />
            )}
          </Route>

          <Route path="/profile">
            {() => (
              <RoleBasedRoute 
                component={ProfilePage} 
                allowedRoles={['estudiante']} 
              />
            )}
          </Route>

          <Route path="/admin">
            {() => (
              <RoleBasedRoute 
                component={AdminPage} 
                allowedRoles={['admin']} 
              />
            )}
          </Route>

          <Route path="/admin/requests">
            {() => (
              <RoleBasedRoute 
                component={AdminRequestsPage} 
                allowedRoles={['admin']} 
              />
            )}
          </Route>

          <Route path="/admin/students">
            {() => (
              <RoleBasedRoute 
                component={StudentsPage} 
                allowedRoles={['admin']} 
              />
            )}
          </Route>

          <Route path="/superadmin">
            {() => (
              <RoleBasedRoute 
                component={SuperAdminPage} 
                allowedRoles={['superuser']} 
              />
            )}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
