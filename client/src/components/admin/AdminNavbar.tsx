import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function AdminNavbar() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    {
      name: "Solicitudes",
      href: "/admin/requests",
      active: location === "/admin/requests",
    },
    {
      name: "Documentos",
      href: "/admin/documents",
      active: location === "/admin/documents",
    },
    {
      name: "Estudiantes",
      href: "/admin/students",
      active: location === "/admin/students",
    },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 max-w-7xl items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/admin">
            <span className="font-bold">Panel Administrativo</span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant={item.active ? "secondary" : "ghost"}
                className="h-8"
                onClick={() => setLocation(item.href)}
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <p className="text-foreground/60">
              Admin: {user?.username}
            </p>
          </div>
          <Button
            variant="ghost"
            className="h-8 px-3"
            onClick={() => logoutMutation.mutate()}
          >
            Salir
          </Button>
        </div>
      </div>
    </nav>
  );
} 