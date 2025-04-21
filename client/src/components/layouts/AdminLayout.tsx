import { AdminNavbar } from "@/components/admin/AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      <AdminNavbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 