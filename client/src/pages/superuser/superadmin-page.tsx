import { Link, useLocation } from "wouter";
import { Home, Users, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";

export default function SuperAdminPage() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <SuperAdminLayout>
      <h2 className="text-xl font-semibold mb-4">Panel de Super Administrador</h2>
      <p>Esta vista está en desarrollo...</p>
    </SuperAdminLayout>
  );
} 