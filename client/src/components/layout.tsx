import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  // Get page title based on location
  const getPageTitle = () => {
    switch (location) {
      case "/":
      case "/profile":
        return "Mi Perfil";
      case "/documents":
        return "Mis Documentos";
      case "/requests":
        return "Mis Solicitudes";
      case "/admin/students":
        return "Gestión de Estudiantes";
      case "/admin/requests":
        return "Gestión de Solicitudes";
      case "/admin/users":
        return "Gestión de Usuarios";
      default:
        if (location.startsWith("/admin/students/")) {
          return "Detalle de Estudiante";
        }
        return "Portal del Estudiante";
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button 
            type="button" 
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
            onClick={() => {
              const sidebar = document.getElementById("mobile-sidebar");
              if (sidebar) {
                sidebar.classList.toggle("hidden");
              }
            }}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
            </div>
            
            {user && (
              <div className="ml-4 flex items-center md:ml-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.full_name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Mobile sidebar (hidden by default) */}
        <div id="mobile-sidebar" className="md:hidden fixed inset-0 z-40 hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => {
            const sidebar = document.getElementById("mobile-sidebar");
            if (sidebar) {
              sidebar.classList.add("hidden");
            }
          }}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                type="button" 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => {
                  const sidebar = document.getElementById("mobile-sidebar");
                  if (sidebar) {
                    sidebar.classList.add("hidden");
                  }
                }}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
