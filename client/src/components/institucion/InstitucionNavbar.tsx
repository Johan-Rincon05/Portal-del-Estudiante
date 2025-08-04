import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/utils";
import { 
  BarChart3,
  Users, 
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

export function InstitucionNavbar() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    {
      name: "Dashboard",
      href: "/institucion/dashboard",
      icon: BarChart3,
      active: location === "/institucion/dashboard",
    },
    {
      name: "Estudiantes",
      href: "/institucion/students",
      icon: Users,
      active: location === "/institucion/students",
    },
    {
      name: "Solicitudes",
      href: "/institucion/requests",
      icon: MessageSquare,
      active: location === "/institucion/requests",
    },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold">Portal del Estudiante</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-medium",
                    item.active && "text-primary"
                  )}
                  onClick={() => setLocation(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mx-2"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex-col items-start">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}