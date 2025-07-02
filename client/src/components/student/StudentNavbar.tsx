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
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 transition-colors sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className={cn(
              "flex items-center gap-2 transition-all duration-300 relative py-2 px-4 rounded-lg group z-10",
              location === "/" 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              <Home className={cn(
                "w-5 h-5 transition-transform duration-300",
                location === "/" ? "scale-110" : "group-hover:scale-110"
              )} />
              <span>Inicio</span>
              {location === "/" && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm" />
              )}
              <div className={cn(
                "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-300 shadow-sm",
                location === "/" ? "w-full left-0" : "group-hover:w-full group-hover:left-0"
              )} />
            </Link>
            
            <Link href="/documents" className={cn(
              "flex items-center gap-2 transition-all duration-300 relative py-2 px-4 rounded-lg group z-10",
              location === "/documents" 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              <FileText className={cn(
                "w-5 h-5 transition-transform duration-300",
                location === "/documents" ? "scale-110" : "group-hover:scale-110"
              )} />
              <span>Documentos</span>
              {location === "/documents" && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm" />
              )}
              <div className={cn(
                "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-300 shadow-sm",
                location === "/documents" ? "w-full left-0" : "group-hover:w-full group-hover:left-0"
              )} />
            </Link>

            <Link href="/payments" className={cn(
              "flex items-center gap-2 transition-all duration-300 relative py-2 px-4 rounded-lg group z-10",
              location === "/payments" 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              <CreditCard className={cn(
                "w-5 h-5 transition-transform duration-300",
                location === "/payments" ? "scale-110" : "group-hover:scale-110"
              )} />
              <span>Mis Pagos</span>
              {location === "/payments" && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm" />
              )}
              <div className={cn(
                "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-300 shadow-sm",
                location === "/payments" ? "w-full left-0" : "group-hover:w-full group-hover:left-0"
              )} />
            </Link>
            
            <Link href="/requests" className={cn(
              "flex items-center gap-2 transition-all duration-300 relative py-2 px-4 rounded-lg group z-10",
              location === "/requests" 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              <MessageSquare className={cn(
                "w-5 h-5 transition-transform duration-300",
                location === "/requests" ? "scale-110" : "group-hover:scale-110"
              )} />
              <span>Solicitudes</span>
              {location === "/requests" && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm" />
              )}
              <div className={cn(
                "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-300 shadow-sm",
                location === "/requests" ? "w-full left-0" : "group-hover:w-full group-hover:left-0"
              )} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 rounded-lg group z-10"
            >
              {theme === "light" ? (
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 group-hover:scale-110 dark:-rotate-90 dark:scale-0" />
              ) : (
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 group-hover:scale-110 dark:rotate-0 dark:scale-100" />
              )}
              <span className="sr-only">Cambiar tema</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300 py-2 px-4 rounded-lg group relative",
                    location === "/profile" 
                      ? "text-primary font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    location === "/profile" ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span>Perfil</span>
                  {location === "/profile" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border shadow-lg z-50">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer hover:bg-accent">
                    <User className="w-4 h-4" />
                    <span>Ver Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive cursor-pointer transition-colors"
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