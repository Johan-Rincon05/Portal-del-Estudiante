import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ProfilePage from "@/pages/student/ProfilePage";
import DocumentsPage from "@/pages/student/DocumentsPage";
import RequestsPage from "@/pages/student/RequestsPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import StudentDetailPage from "@/pages/admin/StudentDetailPage";
import AdminRequestsPage from "@/pages/admin/RequestsPage";
import UsersPage from "@/pages/superuser/UsersPage";
import { ProtectedRoute } from "@/lib/protected-route";
import Layout from "@/components/Layout";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={["estudiante", "admin", "superuser"]}>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute allowedRoles={["estudiante", "admin", "superuser"]}>
              <Layout>
                <DocumentsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests" 
          element={
            <ProtectedRoute allowedRoles={["estudiante", "admin", "superuser"]}>
              <Layout>
                <RequestsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Admin routes */}
        <Route 
          path="/admin/students" 
          element={
            <ProtectedRoute allowedRoles={["admin", "superuser"]}>
              <Layout>
                <StudentsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students/:id" 
          element={
            <ProtectedRoute allowedRoles={["admin", "superuser"]}>
              <Layout>
                <StudentDetailPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/requests" 
          element={
            <ProtectedRoute allowedRoles={["admin", "superuser"]}>
              <Layout>
                <AdminRequestsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Superuser routes */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Redirect to login if not logged in */}
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
}

export default App;
