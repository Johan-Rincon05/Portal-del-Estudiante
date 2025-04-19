import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import supabase from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LoginInput, RegisterUserInput, CreateUserInput } from '@shared/schema';
import { type User, type UserMetadata } from '@supabase/supabase-js';

export type AuthUser = User & {
  user_metadata: UserMetadata & {
    role?: 'estudiante' | 'admin' | 'superuser';
  };
};

export function useAuth() {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current user
  const {
    data: user,
    isLoading,
    refetch
  } = useQuery<AuthUser | null>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user as AuthUser | null;
    },
    enabled: isInitialized,
  });

  // Initialize auth by getting the session
  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        refetch();
      }
      setIsInitialized(true);
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refetch();
      } else {
        queryClient.setQueryData(['/api/user'], null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) throw error;
      return data.user as AuthUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido/a al Portal del Estudiante",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterUserInput) => {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            role: 'estudiante',
            full_name: userData.fullName
          },
        }
      });
      
      if (authError) throw authError;
      
      // Create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user?.id,
          full_name: userData.fullName,
          email: userData.email,
          document_type: userData.documentType,
          document_number: userData.documentNumber,
          birth_date: userData.birthDate,
          phone: userData.phone,
          city: userData.city,
          address: userData.address,
        }]);
      
      if (profileError) throw profileError;
      
      return authData.user as AuthUser;
    },
    onSuccess: () => {
      toast({
        title: "Registro exitoso",
        description: "Por favor verifica tu correo electrónico para confirmar tu cuenta",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de registro",
        description: error.message || "No se pudo completar el registro",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el correo",
        variant: "destructive",
      });
    },
  });

  // Update user role (admin function)
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-update-user-role', {
        body: { userId, role }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el rol",
        variant: "destructive",
      });
    },
  });

  // Create user (admin function)
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserInput) => {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          role: userData.role
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    },
  });

  // Delete user (admin function)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading: isLoading || !isInitialized,
    loginMutation,
    registerMutation,
    logoutMutation,
    resetPasswordMutation,
    updateUserRoleMutation,
    createUserMutation,
    deleteUserMutation,
  };
}

export default useAuth;
