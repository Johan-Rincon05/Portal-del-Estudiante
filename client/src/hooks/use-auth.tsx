import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { 
  LoginData, 
  RegisterData, 
  User, 
  Profile,
  loginSchema,
  registerSchema 
} from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type UserWithProfile = User & Profile;

type AuthContextType = {
  user: UserWithProfile | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserWithProfile, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ message: string }, Error, RegisterData>;
  resetPasswordMutation: UseMutationResult<{ message: string }, Error, { email: string }>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<UserWithProfile | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Validate with zod
      loginSchema.parse(credentials);
      
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data: { user: UserWithProfile }) => {
      queryClient.setQueryData(["/api/user"], data.user);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.user.full_name}`,
      });
      setLocation("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Error de inicio de sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Validate with zod
      registerSchema.parse(data);
      
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({
        title: "Registro exitoso",
        description: data.message,
      });
      setLocation("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      setLocation("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await apiRequest("POST", "/api/reset-password", { email });
      return await res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({
        title: "Correo enviado",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar correo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        resetPasswordMutation,
      }}
    >
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
