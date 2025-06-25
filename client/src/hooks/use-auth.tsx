import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser, loginSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient, setToken, removeToken } from "../lib/query-client";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
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
      try {
        console.log('Intentando iniciar sesión con:', credentials.username);
        const response = await apiRequest<User & { token: string }>("/api/login", {
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
    onSuccess: (data) => {
      console.log('Datos completos recibidos del login:', data);
      const { token, ...user } = data;
      console.log('Token extraído:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('Usuario extraído:', user);
      
      // Guardar el token
      if (token) {
        console.log('Guardando token en localStorage...');
        setToken(token);
        console.log('Token guardado. Verificando...');
        const savedToken = localStorage.getItem('token');
        console.log('Token verificado en localStorage:', savedToken ? savedToken.substring(0, 20) + '...' : 'No encontrado');
      } else {
        console.error('No se recibió token en la respuesta del login');
      }
      
      // Actualizar el estado local inmediatamente
      setLocalUser(user);
      
      // Actualizar el estado del usuario en el query client
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
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.username}!`,
      });
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
      // Eliminar el token
      removeToken();
      
      // Limpiar el estado local inmediatamente
      setLocalUser(null);
      
      // Limpiar el estado del usuario en el query client
      queryClient.setQueryData(["/api/user"], null);
      
      // Limpiar todas las queries relacionadas
      queryClient.removeQueries({ queryKey: ["/api/profiles"] });
      queryClient.removeQueries({ queryKey: ["/api/documents"] });
      queryClient.removeQueries({ queryKey: ["/api/requests"] });
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      // Redirigir a auth
      setLocation('/auth');
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
      try {
        const response = await apiRequest("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.email,
            password: data.password,
            role: data.role,
          }),
        });

        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Error al crear usuario');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      console.error('Error al crear usuario:', error);
      toast({
        title: "Error al crear usuario",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive"
      });
    }
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
        user: localUser || null,
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