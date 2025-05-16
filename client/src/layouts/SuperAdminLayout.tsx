import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-background border-b transition-colors">
        <div className="container mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/superadmin" className={cn(
              "flex items-center gap-2 transition-colors",
              location === "/superadmin" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <Home className="w-5 h-5" />
              <span>Inicio</span>
            </Link>
            <Link href="/admin/users" className={cn(
              "flex items-center gap-2 transition-colors",
              location === "/admin/users" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <Users className="w-5 h-5" />
              <span>Usuarios</span>
            </Link>
            <Link href="/admin/requests" className={cn(
              "flex items-center gap-2 transition-colors",
              location === "/admin/requests" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <Settings className="w-5 h-5" />
              <span>Solicitudes</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary"
            >
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Cambiar tema</span>
            </Button>
            <span>Bienvenido, {user?.username}</span>
            <Button
              onClick={() => logoutMutation.mutate()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
} 