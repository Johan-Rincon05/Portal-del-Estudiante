import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider as CustomAuthProvider, useAuth } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <CustomAuthProvider>
      {children}
    </CustomAuthProvider>
  );
}

export { useAuth };
