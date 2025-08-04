import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  MessageSquare, 
  LogOut, 
  Sun, 
  Moon, 
  User,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CarteraNavbar() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    {
      name: "Validación de Pagos",
      href: "/cartera/payments/validation",
      icon: CreditCard,
      active: location === "/cartera/payments/validation",
    },
    {
      name: "Solicitudes Financieras",
      href: "/cartera/requests",
      icon: MessageSquare,
      active: location === "/cartera/requests",
    },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 transition-colors sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-foreground">Panel de Cartera</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant={item.active ? "secondary" : "ghost"}
                    className={cn(
                      "flex items-center gap-2 transition-all duration-300 relative py-2 px-4 rounded-lg group z-10 h-10",
                      item.active 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setLocation(item.href)}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-transform duration-300",
                      item.active ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span>{item.name}</span>
                    {item.active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm" />
                    )}
                    <div className={cn(
                      "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-300 shadow-sm",
                      item.active ? "w-full left-0" : "group-hover:w-full group-hover:left-0"
                    )} />
                  </Button>
                );
              })}
            </nav>
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
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">Cartera: {user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border shadow-lg z-50">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-accent">
                  <User className="w-4 h-4" />
                  <span>Ver Perfil</span>
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