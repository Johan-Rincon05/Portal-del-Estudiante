import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Profile, Document } from "@shared/schema";

interface StudentWithDocuments extends Profile {
  documents: Document[];
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDocuments | null>(null);

  // Obtener estudiantes y sus documentos
  const { data: students = [], isLoading } = useQuery<StudentWithDocuments[]>({
    queryKey: ["admin", "students"],
    queryFn: async () => {
      const response = await fetch("/api/admin/students");
      if (!response.ok) {
        throw new Error("Error al obtener los estudiantes");
      }
      return response.json();
    },
  });

  // Filtrar estudiantes
  const filteredStudents = students.filter((student) => {
    const searchTerm = search.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(searchTerm) ||
      student.documentNumber?.toLowerCase().includes(searchTerm)
    );
  });

  const getDocumentStatusColor = (documentType: string, studentDocs: Document[]) => {
    const hasDocument = studentDocs.some(doc => doc.type === documentType);
    return hasDocument ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const requiredDocuments = [
    { type: "cedula", label: "Cédula" },
    { type: "diploma", label: "Diploma" },
    { type: "acta", label: "Acta de Grado" },
    { type: "foto", label: "Fotografía" },
    { type: "recibo", label: "Recibo de Pago" },
    { type: "formulario", label: "Formulario" },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <p>Cargando estudiantes...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-bold">Gestión de Estudiantes</h1>
            <p className="text-muted-foreground mt-2">
              Visualiza y gestiona los datos y documentos de los estudiantes
            </p>
          </div>

          {/* Buscador */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Estudiante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o número de documento"
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Estudiantes */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Estado Documentos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.documentNumber || "No registrado"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {requiredDocuments.map((doc) => (
                            <Badge
                              key={doc.type}
                              variant="secondary"
                              className={getDocumentStatusColor(doc.type, student.documents)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {doc.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Estudiante</DialogTitle>
                              <DialogDescription>
                                Información personal y documentos del estudiante
                              </DialogDescription>
                            </DialogHeader>
                            {selectedStudent && (
                              <div className="grid gap-6">
                                {/* Datos Personales */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Datos Personales</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Nombre Completo</Label>
                                        <p className="text-sm mt-1">{selectedStudent.fullName}</p>
                                      </div>
                                      <div>
                                        <Label>Correo Electrónico</Label>
                                        <p className="text-sm mt-1">{selectedStudent.email}</p>
                                      </div>
                                      <div>
                                        <Label>Tipo de Documento</Label>
                                        <p className="text-sm mt-1">{selectedStudent.documentType || "No registrado"}</p>
                                      </div>
                                      <div>
                                        <Label>Número de Documento</Label>
                                        <p className="text-sm mt-1">{selectedStudent.documentNumber || "No registrado"}</p>
                                      </div>
                                      <div>
                                        <Label>Teléfono</Label>
                                        <p className="text-sm mt-1">{selectedStudent.phone || "No registrado"}</p>
                                      </div>
                                      <div>
                                        <Label>Ciudad</Label>
                                        <p className="text-sm mt-1">{selectedStudent.city || "No registrada"}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <Label>Dirección</Label>
                                        <p className="text-sm mt-1">{selectedStudent.address || "No registrada"}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Documentos */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Documentos</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      {requiredDocuments.map((docType) => {
                                        const document = selectedStudent.documents.find(
                                          (doc) => doc.type === docType.type
                                        );
                                        return (
                                          <Card key={docType.type}>
                                            <CardContent className="p-4">
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <h4 className="font-medium">{docType.label}</h4>
                                                  {document ? (
                                                    <>
                                                      <p className="text-sm text-muted-foreground mt-1">
                                                        {document.name}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        Subido el: {new Date(document.uploadedAt).toLocaleDateString()}
                                                      </p>
                                                    </>
                                                  ) : (
                                                    <p className="text-sm text-red-500 mt-1">
                                                      No cargado
                                                    </p>
                                                  )}
                                                </div>
                                                {document && (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(document.path, '_blank')}
                                                  >
                                                    <FileText className="h-4 w-4" />
                                                  </Button>
                                                )}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        );
                                      })}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 