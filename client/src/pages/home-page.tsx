import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, MessageSquare, User2, LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portal Estudiantil</h1>
          <p className="text-muted-foreground">Bienvenido, {user.username}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </>
          )}
        </Button>
      </header>

      <main>
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documentos
                  </CardTitle>
                  <CardDescription>Gestiona tus documentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Sube y administra documentos importantes como certificados, constancias y formularios.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Ver documentos</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Solicitudes
                  </CardTitle>
                  <CardDescription>Realiza y consulta solicitudes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Crea nuevas solicitudes para trámites académicos y da seguimiento a las existentes.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Ver solicitudes</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User2 className="h-5 w-5 mr-2" />
                    Perfil
                  </CardTitle>
                  <CardDescription>Información personal</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Mantén actualizada tu información personal y datos de contacto.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Editar perfil</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Mis Documentos</CardTitle>
                <CardDescription>Visualiza y administra tus documentos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No hay documentos disponibles. Utiliza el botón para subir un nuevo documento.
                </p>
                <Button>Subir documento</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Mis Solicitudes</CardTitle>
                <CardDescription>Visualiza y administra tus solicitudes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No hay solicitudes disponibles. Utiliza el botón para crear una nueva solicitud.
                </p>
                <Button>Nueva solicitud</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>Gestiona tu información personal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Nombre de usuario</h3>
                      <p>{user.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Rol</h3>
                      <p>{user.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Actualizar información</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}