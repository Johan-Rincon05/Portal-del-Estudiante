import { createContext, ReactNode, useContext } from "react";
import { useAuth as useAuthHook } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

type AuthContextType = ReturnType<typeof useAuthHook>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();

  // Add a loading spinner if auth is still initializing
  if (auth.isLoading && !auth.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
