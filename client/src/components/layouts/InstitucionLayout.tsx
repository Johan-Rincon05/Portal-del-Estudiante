import { ReactNode } from "react";
import { InstitucionNavbar } from "@/components/institucion/InstitucionNavbar";

interface InstitucionLayoutProps {
  children: ReactNode;
}

export function InstitucionLayout({ children }: InstitucionLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <InstitucionNavbar />
      <main className="min-h-[calc(100vh-4rem)] transition-colors">
        {children}
      </main>
    </div>
  );
}