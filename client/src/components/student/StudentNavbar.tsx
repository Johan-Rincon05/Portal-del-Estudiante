import { Link, useLocation } from "wouter";
import { Home, FileText, MessageSquare, User, LogOut, Sun, Moon, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";

export function StudentNavbar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-background border-b transition-colors">
      <div className="container mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className={cn(
              "flex items-center gap-2 transition-colors",
              location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <Home className="w-5 h-5" />
              <span>Inicio</span>
            </Link>
            
            <Link href="/documents" className={cn(
              "flex items-center gap-2 transition-colors",
              location === "/documents" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <FileText className="w-5 h-5" />
              <span>Documentos</span>
            </Link>

            <Link href="/payments" className={cn(
              "flex items-center gap-2 transition-colors",
              location === "/payments" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <CreditCard className="w-5 h-5" />
              <span>Mis Pagos</span>
            </Link>
            
            <Link href="/requests" className={cn(
              "flex items-center gap-2 transition-colors",
              location === "/requests" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <MessageSquare className="w-5 h-5" />
              <span>Solicitudes</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary"
            >
              {theme === "light" ? (
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              ) : (
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              )}
              <span className="sr-only">Cambiar tema</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "flex items-center gap-2 transition-colors outline-none",
                location === "/profile" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                <User className="w-5 h-5" />
                <span>Perfil</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    <span>Ver Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-2 text-red-600 hover:text-white focus:text-white hover:bg-red-600 focus:bg-red-600 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
} 