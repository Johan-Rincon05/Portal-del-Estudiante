import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, UserPlus, UserCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from '@/hooks/use-toast';
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UniversityProgramSelect, universityProgramSchema } from '@/components/UniversityProgramSelect';
import axios from 'axios';

// Esquema de validación para crear usuario
const createUserSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['estudiante', 'admin', 'superuser'])
});

// Definir los tipos para los formularios
type CreateUserFormValues = z.infer<typeof createUserSchema>;

type EditUserFormValues = {
  fullName: string;
  personalEmail: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  birthPlace: string;
  phone: string;
  address: string;
  city: string;
  neighborhood: string;
  locality: string;
  socialStratum: string;
  bloodType: string;
  conflictVictim: string;
  universityId: number | undefined;
  programId: number | undefined;
};

const UsersPage = () => {
  const { createUserMutation, updateUserRoleMutation, deleteUserMutation } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const [universityData, setUniversityData] = useState<any>(null);
  
  // Setup forms
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'estudiante'
    }
  });

  const editForm = useForm<EditUserFormValues>({
    defaultValues: {
      fullName: '',
      personalEmail: '',
      documentType: '',
      documentNumber: '',
      birthDate: '',
      birthPlace: '',
      phone: '',
      address: '',
      city: '',
      neighborhood: '',
      locality: '',
      socialStratum: '',
      bloodType: '',
      conflictVictim: '',
      universityId: undefined,
      programId: undefined
    }
  });

  // Obtener usuarios en tiempo real desde la API
  const { data: users, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener usuarios');
      }
      const data = await res.json();
      console.log('Respuesta de /api/admin/users:', data);
      return data;
    },
    retry: 1,
    retryDelay: 1000
  });
  
  // Actualizar los valores del formulario cuando cambia el usuario a editar
  useEffect(() => {
    if (editUser) {
      editForm.reset({
        fullName: editUser.fullName || '',
        personalEmail: editUser.personalEmail || '',
        documentType: editUser.documentType || '',
        documentNumber: editUser.documentNumber || '',
        birthDate: editUser.birthDate || '',
        birthPlace: editUser.birthPlace || '',
        phone: editUser.phone || '',
        address: editUser.address || '',
        city: editUser.city || '',
        neighborhood: editUser.neighborhood || '',
        locality: editUser.locality || '',
        socialStratum: editUser.socialStratum || '',
        bloodType: editUser.bloodType || '',
        conflictVictim: editUser.conflictVictim || '',
        universityId: editUser.universityId ? Number(editUser.universityId) : undefined,
        programId: editUser.programId ? Number(editUser.programId) : undefined
      });
    }
  }, [editUser, editForm]);

  // Al abrir el modal de edición, obtener los datos académicos del usuario
  useEffect(() => {
    const fetchUniversityData = async () => {
      if (editUser && editUser.id) {
        try {
          const res = await axios.get(`/api/university-data/${editUser.id}`);
          setUniversityData(res.data);
          editForm.reset({
            ...editForm.getValues(),
            fullName: editUser.fullName || '',
            personalEmail: editUser.personalEmail || '',
            documentType: editUser.documentType || '',
            documentNumber: editUser.documentNumber || '',
            birthDate: editUser.birthDate || '',
            birthPlace: editUser.birthPlace || '',
            phone: editUser.phone || '',
            address: editUser.address || '',
            city: editUser.city || '',
            neighborhood: editUser.neighborhood || '',
            locality: editUser.locality || '',
            socialStratum: editUser.socialStratum || '',
            bloodType: editUser.bloodType || '',
            conflictVictim: editUser.conflictVictim || '',
            universityId: res.data?.universityId ? Number(res.data.universityId) : undefined,
            programId: res.data?.programId ? Number(res.data.programId) : undefined
          });
        } catch (error) {
          setUniversityData(null);
          editForm.reset({
            ...editForm.getValues(),
            fullName: editUser.fullName || '',
            personalEmail: editUser.personalEmail || '',
            documentType: editUser.documentType || '',
            documentNumber: editUser.documentNumber || '',
            birthDate: editUser.birthDate || '',
            birthPlace: editUser.birthPlace || '',
            phone: editUser.phone || '',
            address: editUser.address || '',
            city: editUser.city || '',
            neighborhood: editUser.neighborhood || '',
            locality: editUser.locality || '',
            socialStratum: editUser.socialStratum || '',
            bloodType: editUser.bloodType || '',
            conflictVictim: editUser.conflictVictim || '',
            universityId: undefined,
            programId: undefined
          });
        }
      }
    };
    fetchUniversityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editUser]);

  // Aplica filtro de búsqueda solo si users es un array
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const username = user.username || user.name || '';
    const email = user.email || '';
    const fullName = user.fullName || '';
    const documentNumber = user.documentNumber || '';
    return (
      !searchTerm ||
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleCreateUser = async (values: CreateUserFormValues) => {
    try {
      await createUserMutation.mutateAsync(values);
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      form.reset();
      setShowCreateForm(false);
    } catch (error: any) {
      toast({
        title: "Error al crear usuario",
        description: error.message || "Ha ocurrido un error al crear el usuario",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateRole = (userId: string, role: string) => {
    updateUserRoleMutation.mutate({ userId, role }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({
          title: "Rol actualizado",
          description: "El rol del usuario ha sido actualizado correctamente",
        });
      },
      onError: (error) => {
        toast({
          title: "Error al actualizar rol",
          description: error.message || "Ha ocurrido un error al actualizar el rol",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
          setUserToDelete(null);
          toast({
            title: "Usuario eliminado",
            description: "El usuario ha sido eliminado correctamente",
          });
        },
        onError: (error) => {
          toast({
            title: "Error al eliminar usuario",
            description: error.message || "Ha ocurrido un error al eliminar el usuario",
            variant: "destructive"
          });
        }
      });
    }
  };

  // Función para abrir el modal de edición con el usuario seleccionado
  const handleOpenEditModal = (user: any) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseEditModal = () => {
    setEditUser(null);
    setIsEditModalOpen(false);
  };

  // Mutación para actualizar usuario y datos académicos
  const editUserMutation = useMutation({
    mutationFn: async ({ profileData, universityData, id }: any) => {
      // Actualizar perfil
      const resProfile = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });
      if (!resProfile.ok) {
        const errorData = await resProfile.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el perfil');
      }

      // Actualizar datos académicos
      const resUniversity = await fetch('/api/university-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(universityData),
        credentials: 'include'
      });
      if (!resUniversity.ok) {
        const errorData = await resUniversity.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar datos académicos');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuario actualizado exitosamente",
        description: "Los datos del usuario han sido actualizados correctamente"
      });
      setIsEditModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar usuario",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  // Lógica para guardar cambios del modal
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setIsSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const values = Object.fromEntries(formData.entries());

      // Actualizar datos personales (si tienes endpoint)
      await updateUserRoleMutation.mutateAsync({
        userId: editUser.id.toString(),
        role: editUser.role
      });

      // Actualizar datos académicos
      await axios.post('/api/university-data', {
        userId: editUser.id,
        universityId: values.universityId ? Number(values.universityId) : undefined,
        programId: values.programId ? Number(values.programId) : undefined
      });

      setIsEditModalOpen(false);
      toast({
        title: "Usuario actualizado exitosamente",
        description: "Los datos del usuario han sido actualizados correctamente"
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast({
        title: "Error al actualizar usuario",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gestión de Usuarios</h2>
          <p className="text-sm text-muted-foreground">Administra los usuarios y roles del sistema</p>
        </div>
        <Button 
          className="mt-3 sm:mt-0"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Crear usuario
        </Button>
      </div>
      
      {/* Create user form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-md">Crear nuevo usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="user-email">Correo electrónico</FormLabel>
                        <FormControl>
                          <Input
                            id="user-email"
                            type="email"
                            placeholder="nuevo@ejemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="user-password">Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            id="user-password"
                            type="password"
                            placeholder="Contraseña temporal"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="user-role">Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger id="user-role">
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="estudiante">Estudiante</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="superuser">Superusuario</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="send-email" />
                  <label htmlFor="send-email" className="text-sm text-muted-foreground">
                    Enviar email de bienvenida
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setShowCreateForm(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear usuario"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-64 mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Buscar usuarios..."
              className="pl-10 pr-3 py-2 border border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading && (
            <div className="text-center text-muted-foreground mt-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2">Cargando usuarios...</p>
            </div>
          )}

          {isError && (
            <div className="text-center text-red-600 mt-8">
              Error al cargar usuarios: {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          )}

          {!isLoading && !isError && !Array.isArray(users) && (
            <div className="text-center text-red-600 mt-8">
              No autorizado o error de sesión. Por favor, vuelve a iniciar sesión.
            </div>
          )}

          {!isLoading && !isError && Array.isArray(users) && users.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No hay usuarios registrados.
            </div>
          )}

          {!isLoading && !isError && Array.isArray(users) && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre completo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actualizado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo Doc.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">N° Documento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full ${user.role === 'admin' || user.role === 'superuser' ? 'bg-accent-500 text-white' : 'bg-primary-100 text-primary-600'} flex items-center justify-center`}>
                            <UserCircle className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{user.username || 'Sin usuario'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.role === 'superuser' ? 'default' : 'secondary'}>
                          {user.role || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.documentType || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.documentNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary-600 hover:text-primary-900 mr-3" 
                          onClick={() => handleOpenEditModal(user)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && Array.isArray(users) && users.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredUsers.length}</span> resultados
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edición de usuario */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-full max-w-4xl mx-auto p-6 rounded-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editUser && (
            <>
              {console.log('editUser:', editUser)}
              <Form {...editForm}>
                <form className="space-y-8" onSubmit={handleEditUserSubmit}>
                  {/* Sección: Datos personales */}
                  <div>
                    <h3 className="text-base font-semibold mb-4 text-primary">Datos personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <label className="block text-sm font-medium">Nombre completo</label>
                        <Input name="fullName" defaultValue={editUser.fullName || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Correo personal</label>
                        <Input name="personalEmail" defaultValue={editUser.personalEmail || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Tipo de documento</label>
                        <Select name="documentType" defaultValue={editUser.documentType || ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cedula">Cédula</SelectItem>
                            <SelectItem value="pasaporte">Pasaporte</SelectItem>
                            <SelectItem value="tarjeta_identidad">Tarjeta de identidad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Número de documento</label>
                        <Input name="documentNumber" defaultValue={editUser.documentNumber || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Fecha de nacimiento</label>
                        <Input 
                          type="date" 
                          name="birthDate" 
                          defaultValue={editUser.birthDate ? new Date(editUser.birthDate).toISOString().split('T')[0] : ''} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Lugar de nacimiento</label>
                        <Input name="birthPlace" defaultValue={editUser.birthPlace || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Teléfono</label>
                        <Input name="phone" defaultValue={editUser.phone || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Dirección</label>
                        <Input name="address" defaultValue={editUser.address || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Ciudad</label>
                        <Input name="city" defaultValue={editUser.city || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Barrio</label>
                        <Input name="neighborhood" defaultValue={editUser.neighborhood || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Localidad</label>
                        <Input name="locality" defaultValue={editUser.locality || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Estrato</label>
                        <Input name="socialStratum" defaultValue={editUser.socialStratum || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Tipo de sangre</label>
                        <Select name="bloodType" defaultValue={editUser.bloodType || ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium">¿Víctima de conflicto?</label>
                        <Select name="conflictVictim" defaultValue={editUser.conflictVictim ? 'Sí' : 'No'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sí">Sí</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Datos académicos */}
                  <div>
                    <h3 className="text-base font-semibold mb-4 text-primary">Datos académicos</h3>
                    <UniversityProgramSelect
                      form={editForm}
                      defaultUniversityId={universityData?.universityId ? Number(universityData.universityId) : undefined}
                      defaultProgramId={universityData?.programId ? Number(universityData.programId) : undefined}
                      onUniversityChange={(universityId) => {
                        console.log('Universidad seleccionada:', universityId);
                      }}
                      onProgramChange={(programId) => {
                        console.log('Programa seleccionado:', programId);
                      }}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseEditModal}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar cambios"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default UsersPage;
