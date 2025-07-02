import { StudentNavbar } from "@/components/student/StudentNavbar";
import { ReactNode } from "react";

interface StudentLayoutProps {
  children: ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StudentNavbar />
      <main className="min-h-[calc(100vh-4rem)] transition-colors">
        {children}
      </main>
    </div>
  );
} 