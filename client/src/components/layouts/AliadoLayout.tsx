import { ReactNode } from "react";
import { AliadoNavbar } from "@/components/aliado/AliadoNavbar";

interface AliadoLayoutProps {
  children: ReactNode;
}

export function AliadoLayout({ children }: AliadoLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AliadoNavbar />
      <main className="min-h-[calc(100vh-4rem)] transition-colors">
        {children}
      </main>
    </div>
  );
}