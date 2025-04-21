import { useAuth } from "@/hooks/use-auth";

export default function SuperAdminPage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Panel de Super Administrador</h1>
          <div className="ml-auto flex items-center space-x-4">
            <span>Bienvenido, {user?.username}</span>
            <button
              onClick={() => logoutMutation.mutate()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <h2 className="text-xl font-semibold mb-4">Panel de Super Administrador</h2>
        <p>Esta vista está en desarrollo...</p>
      </main>
    </div>
  );
} 