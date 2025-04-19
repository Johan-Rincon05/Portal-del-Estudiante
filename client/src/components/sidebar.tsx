import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User, FileText, MessageSquare, Users, FileCheck, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isActive = (path: string) => {
    return location === path;
  };

  const linkClasses = (path: string) => {
    return cn(
      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
      isActive(path)
        ? "text-white bg-primary-700"
        : "text-primary-100 hover:text-white hover:bg-primary-600"
    );
  };

  return (
    <div className="flex flex-col w-64">
      <div className="flex flex-col h-0 flex-1 bg-primary-800">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-900">
          <div className="flex items-center">
            <svg className="h-8 w-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="ml-2 text-white text-lg font-semibold">Portal Estudiante</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {/* Student Menu Items - Available to all roles */}
            <Link href="/profile" className={linkClasses("/profile")}>
              <User className="mr-3 h-6 w-6 text-primary-300" />
              Mi Perfil
            </Link>

            <Link href="/documents" className={linkClasses("/documents")}>
              <FileText className="mr-3 h-6 w-6 text-primary-300" />
              Mis Documentos
            </Link>

            <Link href="/requests" className={linkClasses("/requests")}>
              <MessageSquare className="mr-3 h-6 w-6 text-primary-300" />
              Mis Solicitudes
            </Link>

            {/* Admin Menu Items */}
            {(user.role === "admin" || user.role === "superuser") && (
              <div className="border-t border-primary-700 pt-4 mt-4">
                <h3 className="px-3 text-xs text-primary-300 uppercase tracking-wider">
                  Administración
                </h3>
                
                <Link href="/admin/students" className={linkClasses("/admin/students")}>
                  <Users className="mr-3 h-6 w-6 text-primary-300" />
                  Estudiantes
                </Link>

                <Link href="/admin/requests" className={linkClasses("/admin/requests")}>
                  <FileCheck className="mr-3 h-6 w-6 text-primary-300" />
                  Solicitudes
                </Link>
              </div>
            )}

            {/* Superuser Menu Items */}
            {user.role === "superuser" && (
              <div className="border-t border-primary-700 pt-4 mt-4">
                <h3 className="px-3 text-xs text-primary-300 uppercase tracking-wider">
                  Superusuario
                </h3>
                
                <Link href="/admin/users" className={linkClasses("/admin/users")}>
                  <UserCog className="mr-3 h-6 w-6 text-primary-300" />
                  Gestión de Usuarios
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
