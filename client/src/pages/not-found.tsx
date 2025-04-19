import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold">Página no encontrada</h2>
        <p className="text-muted-foreground">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}