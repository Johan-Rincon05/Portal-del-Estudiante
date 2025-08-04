import { ReactNode } from "react";
import { CarteraNavbar } from "@/components/cartera/CarteraNavbar";

interface CarteraLayoutProps {
  children: ReactNode;
}

export function CarteraLayout({ children }: CarteraLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CarteraNavbar />
      <main className="min-h-[calc(100vh-4rem)] transition-colors">
        {children}
      </main>
    </div>
  );
}