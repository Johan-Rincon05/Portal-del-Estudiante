import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser, loginSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  createUserMutation: UseMutationResult<void, Error, { email: string; password: string; role: string }>;
  updateUserRoleMutation: UseMutationResult<void, Error, { userId: string; role: string }>;
  deleteUserMutation: UseMutationResult<void, Error, string>;
};

type LoginData = z.infer<typeof loginSchema>;

type RegisterData = {
  username: string;
  password: string;
  role?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log('Intentando iniciar sesión con:', credentials.username);
        const response = await apiRequest<User>("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });
        console.log('Respuesta del servidor:', response);
        return response;
      } catch (error) {
        console.error('Error en loginMutation:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Error al iniciar sesión");
      }
    },
    onSuccess: (user: User) => {
      console.log('Login exitoso:', user);
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.username}!`,
      });
      window.location.href = '/';
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      return await apiRequest<User>("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          role: credentials.role || "estudiante",
        }),
      });
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${user.username}!`,
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error de registro",
        description: error.message || "No se pudo completar el registro",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      window.location.href = '/auth';
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para crear usuario
  const createUserMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; role: string }) => {
      return await apiRequest("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.email,
          password: data.password,
          role: data.role,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  // Mutation para actualizar el rol de un usuario
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  // Mutation para eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        createUserMutation,
        updateUserRoleMutation,
        deleteUserMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}