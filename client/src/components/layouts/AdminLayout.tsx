import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />
      <main className="min-h-[calc(100vh-4rem)] transition-colors">
        {children}
      </main>
    </div>
  );
} 