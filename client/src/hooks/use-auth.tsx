import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser, loginSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient, setToken, removeToken } from "../lib/query-client";
import { toast } from "sonner"; // Cambiar a Sonner
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User & { token: string }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  createUserMutation: UseMutationResult<any, Error, { email: string; password: string; role: string }>;
  updateUserRoleMutation: UseMutationResult<any, Error, { userId: string; role: string }>;
  deleteUserMutation: UseMutationResult<any, Error, string>;
};

type LoginData = z.infer<typeof loginSchema>;

type RegisterData = {
  username: string;
  password: string;
  role?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  
  // Estado local para el usuario autenticado
  const [localUser, setLocalUser] = useState<User | null>(null);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      return await apiRequest<User | null>("/api/user", {
        method: "GET",
      });
    },
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Sincronizar el estado local con el query
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else if (!isLoading) {
      setLocalUser(null);
    }
  }, [user, isLoading]);

  // Efecto para manejar redirecciones basadas en el rol
  useEffect(() => {
    console.log('Efecto de redirección ejecutado:', { user: localUser, isLoading, currentPath: window.location.pathname });
    
    if (!isLoading) {
      if (localUser) {
        // Usuario autenticado - redirigir según rol
        const currentPath = window.location.pathname;
        let shouldRedirect = false;
        let targetPath = '/';

        switch (localUser.role) {
          case 'superuser':
            if (!currentPath.startsWith('/admin/users') && !currentPath.startsWith('/superadmin')) {
              shouldRedirect = true;
              targetPath = '/admin/users';
            }
            break;
          case 'admin':
            if (!currentPath.startsWith('/admin')) {
              shouldRedirect = true;
              targetPath = '/admin/students';
            }
            break;
          case 'estudiante':
            // Para estudiantes, redirigir a /profile si está en /auth o en una ruta no válida
            if (currentPath === '/auth' || (!currentPath.startsWith('/profile') && 
                !currentPath.startsWith('/documents') && 
                !currentPath.startsWith('/requests') && 
                currentPath !== '/')) {
              shouldRedirect = true;
              targetPath = '/profile';
            }
            break;
          default:
            if (currentPath !== '/') {
              shouldRedirect = true;
              targetPath = '/';
            }
        }

        if (shouldRedirect) {
          console.log('Redirigiendo a:', targetPath);
          setLocation(targetPath);
        }
      } else {
        // Usuario no autenticado - redirigir a auth si no está ahí
        const currentPath = window.location.pathname;
        if (currentPath !== '/auth') {
          console.log('Usuario no autenticado, redirigiendo a /auth');
          setLocation('/auth');
        }
      }
    }
  }, [localUser, isLoading, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Realiza la petición de login
      const response = await apiRequest<User & { token: string }>("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      return response;
    },
    onSuccess: (data) => {
      // Extrae el token y el usuario de la respuesta
      const { token, ...user } = data;
      // Guarda el token en localStorage para futuras peticiones
      setToken(token);
      // Actualiza el usuario local
      setLocalUser(user);
      // Actualiza el estado global del usuario
      queryClient.setQueryData(["/api/user"], user);
      
      // Redirigir inmediatamente según el rol
      let targetPath = '/';
      switch (user.role) {
        case 'superuser':
          targetPath = '/admin/users';
          break;
        case 'admin':
          targetPath = '/admin/students';
          break;
        case 'estudiante':
          targetPath = '/';
          break;
        default:
          targetPath = '/';
      }
      
      console.log('Redirigiendo inmediatamente a:', targetPath);
      setLocation(targetPath);
      
      // Invalidar todas las queries relacionadas para forzar actualización
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      
      toast.success(`Bienvenido, ${user.username}!`); // Usar Sonner
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast.error(error.message || "Credenciales inválidas"); // Usar Sonner
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
      toast.success("Usuario registrado exitosamente"); // Usar Sonner
    },
    onError: (error: Error) => {
      console.error("Register error:", error);
      toast.error(error.message || "Error al registrar usuario"); // Usar Sonner
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<void>("/api/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      // Eliminar el token del localStorage
      removeToken();
      // Limpiar el usuario local
      setLocalUser(null);
      // Limpiar el cache del query client
      queryClient.clear();
      // Redirigir a la página de autenticación
      setLocation('/auth');
      toast.success("Sesión cerrada exitosamente"); // Usar Sonner
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      // Aún así, limpiar el estado local
      removeToken();
      setLocalUser(null);
      queryClient.clear();
      setLocation('/auth');
      toast.error("Error al cerrar sesión"); // Usar Sonner
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; role: string }) => {
      return await apiRequest<any>("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      toast.success("Usuario creado exitosamente"); // Usar Sonner
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      console.error("Create user error:", error);
      toast.error(error.message || "Error al crear usuario"); // Usar Sonner
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest<any>(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      toast.success("Rol actualizado exitosamente"); // Usar Sonner
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      console.error("Update user role error:", error);
      toast.error(error.message || "Error al actualizar rol"); // Usar Sonner
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest<any>(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente"); // Usar Sonner
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      console.error("Delete user error:", error);
      toast.error(error.message || "Error al eliminar usuario"); // Usar Sonner
    },
  });

  const contextValue: AuthContextType = {
    user: localUser,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
    createUserMutation,
    updateUserRoleMutation,
    deleteUserMutation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  
  // Log de depuración
  console.log('[DEBUG] useAuth - Context:', context);
  console.log('[DEBUG] useAuth - User:', context.user);
  
  return context;
}