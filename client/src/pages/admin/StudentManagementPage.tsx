import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Edit, 
  Filter, 
  Search, 
  Calendar,
  User,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  History,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  CreditCard,
  CheckSquare,
  XSquare,
  Users
} from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Student {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  currentStage: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  documents: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  payments: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  requests: {
    total: number;
    pending: number;
    completed: number;
  };
}

interface StageChange {
  id: number;
  studentId: number;
  fromStage: string;
  toStage: string;
  reason: string;
  comments?: string;
  changedBy: string;
  changedAt: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

interface Comment {
  id: number;
  studentId: number;
  author: string;
  content: string;
  createdAt: string;
  type: 'general' | 'stage_change' | 'document' | 'payment';
}

interface StageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onStageChange: (studentId: number, toStage: string, reason: string, comments?: string) => Promise<void>;
  isLoading: boolean;
}

function StageChangeModal({ 
  isOpen, 
  onClose, 
  student, 
  onStageChange, 
  isLoading 
}: StageChangeModalProps) {
  const [toStage, setToStage] = useState('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = async () => {
    if (!student || !toStage || !reason) return;
    
    try {
      await onStageChange(student.id, toStage, reason, comments);
      onClose();
      setToStage('');
      setReason('');
      setComments('');
    } catch (error) {
      console.error('Error changing stage:', error);
    }
  };

  const stages = [
    'Inscripción',
    'Documentación',
    'Pago',
    'Matriculado',
    'En Curso',
    'Graduado',
    'Retirado'
  ];

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cambiar Etapa del Estudiante</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Estudiante</Label>
            <p className="text-sm text-gray-600">
              {student.firstName} {student.lastName} ({student.email})
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Etapa Actual</Label>
            <p className="text-sm text-gray-600">{student.currentStage}</p>
          </div>

          <div>
            <Label className="text-sm font-medium">Nueva Etapa *</Label>
            <Select value={toStage} onValueChange={setToStage}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la nueva etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Motivo del Cambio *</Label>
            <Textarea
              placeholder="Especifica el motivo del cambio de etapa..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Comentarios (Opcional)</Label>
            <Textarea
              placeholder="Comentarios adicionales..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {!toStage || !reason ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Debes seleccionar una nueva etapa y especificar el motivo.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !toStage || !reason}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Cambiar Etapa
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  stageHistory: StageChange[];
  comments: Comment[];
}

function StudentDetailsModal({ 
  isOpen, 
  onClose, 
  student, 
  stageHistory, 
  comments 
}: StudentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  if (!student) return null;

  const getStageBadge = (stage: string) => {
    const variants = {
      'Inscripción': 'bg-blue-100 text-blue-800',
      'Documentación': 'bg-yellow-100 text-yellow-800',
      'Pago': 'bg-orange-100 text-orange-800',
      'Matriculado': 'bg-green-100 text-green-800',
      'En Curso': 'bg-purple-100 text-purple-800',
      'Graduado': 'bg-emerald-100 text-emerald-800',
      'Retirado': 'bg-red-100 text-red-800'
    };
    return variants[stage as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Estudiante</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Nombre Completo</Label>
                    <p className="text-sm text-gray-600">
                      {student.firstName} {student.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  {student.phone && (
                    <div>
                      <Label className="text-sm font-medium">Teléfono</Label>
                      <p className="text-sm text-gray-600">{student.phone}</p>
                    </div>
                  )}
                  {student.address && (
                    <div>
                      <Label className="text-sm font-medium">Dirección</Label>
                      <p className="text-sm text-gray-600">{student.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Etapa Actual</Label>
                    <Badge className={getStageBadge(student.currentStage)}>
                      {student.currentStage}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado de Cuenta</Label>
                    <div className="flex space-x-2">
                      <Badge variant={student.isActive ? "default" : "secondary"}>
                        {student.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant={student.isVerified ? "default" : "secondary"}>
                        {student.isVerified ? 'Verificado' : 'No Verificado'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Registro</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(student.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {student.lastLogin && (
                    <div>
                      <Label className="text-sm font-medium">Último Acceso</Label>
                      <p className="text-sm text-gray-600">
                        {new Date(student.lastLogin).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="font-medium">{student.documents.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Aprobados:</span>
                      <span className="font-medium text-green-600">{student.documents.approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pendientes:</span>
                      <span className="font-medium text-yellow-600">{student.documents.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rechazados:</span>
                      <span className="font-medium text-red-600">{student.documents.rejected}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pagos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="font-medium">{student.payments.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Aprobados:</span>
                      <span className="font-medium text-green-600">{student.payments.approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pendientes:</span>
                      <span className="font-medium text-yellow-600">{student.payments.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rechazados:</span>
                      <span className="font-medium text-red-600">{student.payments.rejected}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Solicitudes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="font-medium">{student.requests.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pendientes:</span>
                      <span className="font-medium text-yellow-600">{student.requests.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completadas:</span>
                      <span className="font-medium text-green-600">{student.requests.completed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Historial de Cambios de Etapa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stageHistory.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No hay cambios de etapa registrados</p>
                ) : (
                  <div className="space-y-4">
                    {stageHistory.map((change) => (
                      <div key={change.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStageBadge(change.toStage)}>
                              {change.toStage}
                            </Badge>
                            <span className="text-sm text-gray-600">desde {change.fromStage}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {change.isApproved ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="text-sm text-gray-600">
                              {new Date(change.changedAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-1">Motivo: {change.reason}</p>
                        {change.comments && (
                          <p className="text-sm text-gray-600 mb-2">{change.comments}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Cambiado por: {change.changedBy}</span>
                          {change.approvedBy && (
                            <span>Aprobado por: {change.approvedBy}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comentarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No hay comentarios registrados</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{comment.author}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{comment.type}</Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStageChangeModal, setShowStageChangeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    stage: 'todos',
    status: 'todos',
    verified: 'todos'
  });

  const queryClient = useQueryClient();

  // Simular datos de estudiantes (reemplazar con API real)
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: 1,
        username: 'juan.perez',
        email: 'juan.perez@email.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+1234567890',
        address: 'Calle Principal 123, Ciudad',
        currentStage: 'Matriculado',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-15T10:30:00Z',
        lastLogin: '2024-01-20T15:45:00Z',
        documents: { total: 5, approved: 4, pending: 1, rejected: 0 },
        payments: { total: 3, approved: 3, pending: 0, rejected: 0 },
        requests: { total: 2, pending: 0, completed: 2 }
      },
      {
        id: 2,
        username: 'maria.garcia',
        email: 'maria.garcia@email.com',
        firstName: 'María',
        lastName: 'García',
        phone: '+1234567891',
        currentStage: 'Documentación',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-14T15:20:00Z',
        lastLogin: '2024-01-19T12:30:00Z',
        documents: { total: 3, approved: 1, pending: 2, rejected: 0 },
        payments: { total: 1, approved: 0, pending: 1, rejected: 0 },
        requests: { total: 1, pending: 1, completed: 0 }
      },
      {
        id: 3,
        username: 'carlos.lopez',
        email: 'carlos.lopez@email.com',
        firstName: 'Carlos',
        lastName: 'López',
        currentStage: 'Inscripción',
        isActive: false,
        isVerified: false,
        createdAt: '2024-01-13T12:45:00Z',
        documents: { total: 0, approved: 0, pending: 0, rejected: 0 },
        payments: { total: 0, approved: 0, pending: 0, rejected: 0 },
        requests: { total: 0, pending: 0, completed: 0 }
      }
    ];
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = students;

    if (filters.search) {
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.username.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.stage !== 'todos') {
      filtered = filtered.filter(student => student.currentStage === filters.stage);
    }

    if (filters.status !== 'todos') {
      filtered = filtered.filter(student => 
        filters.status === 'activo' ? student.isActive : !student.isActive
      );
    }

    if (filters.verified !== 'todos') {
      filtered = filtered.filter(student => 
        filters.verified === 'verificado' ? student.isVerified : !student.isVerified
      );
    }

    setFilteredStudents(filtered);
  }, [students, filters]);

  const handleStageChange = async (
    studentId: number, 
    toStage: string, 
    reason: string, 
    comments?: string
  ) => {
    setIsChangingStage(true);
    try {
      // TODO: Implementar llamada a API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, currentStage: toStage }
          : student
      ));

      toast.success('Etapa del estudiante cambiada exitosamente');
    } catch (error) {
      toast.error('Error al cambiar la etapa del estudiante');
      throw error;
    } finally {
      setIsChangingStage(false);
    }
  };

  const getStageBadge = (stage: string) => {
    const variants = {
      'Inscripción': 'bg-blue-100 text-blue-800',
      'Documentación': 'bg-yellow-100 text-yellow-800',
      'Pago': 'bg-orange-100 text-orange-800',
      'Matriculado': 'bg-green-100 text-green-800',
      'En Curso': 'bg-purple-100 text-purple-800',
      'Graduado': 'bg-emerald-100 text-emerald-800',
      'Retirado': 'bg-red-100 text-red-800'
    };
    return variants[stage as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.isActive).length,
    inactive: students.filter(s => !s.isActive).length,
    verified: students.filter(s => s.isVerified).length,
    unverified: students.filter(s => !s.isVerified).length
  };

  // Simular datos de historial y comentarios
  const mockStageHistory: StageChange[] = [
    {
      id: 1,
      studentId: 1,
      fromStage: 'Inscripción',
      toStage: 'Documentación',
      reason: 'Estudiante completó el formulario de inscripción',
      changedBy: 'Admin User',
      changedAt: '2024-01-16T10:00:00Z',
      isApproved: true,
      approvedBy: 'Admin User',
      approvedAt: '2024-01-16T10:05:00Z'
    },
    {
      id: 2,
      studentId: 1,
      fromStage: 'Documentación',
      toStage: 'Pago',
      reason: 'Todos los documentos fueron aprobados',
      changedBy: 'Admin User',
      changedAt: '2024-01-18T14:30:00Z',
      isApproved: true,
      approvedBy: 'Admin User',
      approvedAt: '2024-01-18T14:35:00Z'
    }
  ];

  const mockComments: Comment[] = [
    {
      id: 1,
      studentId: 1,
      author: 'Admin User',
      content: 'Estudiante muy comprometido con sus estudios',
      createdAt: '2024-01-20T09:00:00Z',
      type: 'general'
    },
    {
      id: 2,
      studentId: 1,
      author: 'Admin User',
      content: 'Documentos entregados correctamente',
      createdAt: '2024-01-18T14:30:00Z',
      type: 'document'
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
          <p className="text-gray-600 mt-2">
            Administra y supervisa el progreso de los estudiantes
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verificados</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <XSquare className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">No Verificados</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.unverified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros Avanzados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre, email o usuario..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Etapa</Label>
                <Select 
                  value={filters.stage} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las etapas</SelectItem>
                    <SelectItem value="Inscripción">Inscripción</SelectItem>
                    <SelectItem value="Documentación">Documentación</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Matriculado">Matriculado</SelectItem>
                    <SelectItem value="En Curso">En Curso</SelectItem>
                    <SelectItem value="Graduado">Graduado</SelectItem>
                    <SelectItem value="Retirado">Retirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Verificación</Label>
                <Select 
                  value={filters.verified} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, verified: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="verificado">Verificado</SelectItem>
                    <SelectItem value="no_verificado">No Verificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Estudiantes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Estudiantes ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron estudiantes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {student.email} • {student.username}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStageBadge(student.currentStage)}>
                              {student.currentStage}
                            </Badge>
                            <Badge variant={student.isActive ? "default" : "secondary"}>
                              {student.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <Badge variant={student.isVerified ? "default" : "secondary"}>
                              {student.isVerified ? 'Verificado' : 'No Verificado'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">
                            Doc: {student.documents.approved}/{student.documents.total}
                          </p>
                          <p className="text-gray-600">
                            Pagos: {student.payments.approved}/{student.payments.total}
                          </p>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowStageChangeModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Cambiar Etapa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Cambio de Etapa */}
        <StageChangeModal
          isOpen={showStageChangeModal}
          onClose={() => {
            setShowStageChangeModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onStageChange={handleStageChange}
          isLoading={isChangingStage}
        />

        {/* Modal de Detalles */}
        <StudentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          stageHistory={mockStageHistory}
          comments={mockComments}
        />
      </div>
    </AdminLayout>
  );
} 