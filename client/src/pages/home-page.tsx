import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center py-4 border-b mb-8">
        <h1 className="text-2xl font-bold">Portal Estudiantil</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{user?.username}</span>
            <span className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
              {user?.role}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bienvenido, {user?.username}</h2>
            <p>
              Desde aquí podrás gestionar tus documentos, realizar solicitudes y ver el estado de tus trámites.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button className="w-full">Mis Documentos</Button>
              <Button className="w-full">Mis Solicitudes</Button>
            </div>
          </div>
          
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Estado de tus trámites</h3>
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-md border">
                <div className="flex justify-between">
                  <h4 className="font-medium">Documentos pendientes</h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">3</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tienes documentos pendientes por subir para completar tu perfil.
                </p>
              </div>
              
              <div className="bg-card p-4 rounded-md border">
                <div className="flex justify-between">
                  <h4 className="font-medium">Solicitudes activas</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">1</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tienes solicitudes en revisión por parte de administración.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}