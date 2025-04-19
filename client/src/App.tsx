import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import DocumentsPage from "@/pages/documents-page";
import RequestsPage from "@/pages/requests-page";
import StudentsPage from "@/pages/admin/students-page";
import StudentDetailPage from "@/pages/admin/student-detail-page";
import AdminRequestsPage from "@/pages/admin/requests-page";
import UsersPage from "@/pages/admin/users-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={AuthPage} />
      
      <ProtectedRoute path="/" component={ProfilePage} allowedRoles={["estudiante", "admin", "superuser"]} />
      <ProtectedRoute path="/profile" component={ProfilePage} allowedRoles={["estudiante", "admin", "superuser"]} />
      <ProtectedRoute path="/documents" component={DocumentsPage} allowedRoles={["estudiante", "admin", "superuser"]} />
      <ProtectedRoute path="/requests" component={RequestsPage} allowedRoles={["estudiante", "admin", "superuser"]} />
      
      <ProtectedRoute path="/admin/students" component={StudentsPage} allowedRoles={["admin", "superuser"]} />
      <ProtectedRoute path="/admin/students/:id" component={StudentDetailPage} allowedRoles={["admin", "superuser"]} />
      <ProtectedRoute path="/admin/requests" component={AdminRequestsPage} allowedRoles={["admin", "superuser"]} />
      
      <ProtectedRoute path="/admin/users" component={UsersPage} allowedRoles={["superuser"]} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
