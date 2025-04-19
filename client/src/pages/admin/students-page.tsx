import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Profile } from "@shared/schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function StudentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    startDate: "",
    endDate: "",
  });

  // Fetch students/profiles
  const { data: students, isLoading } = useQuery({
    queryKey: ["/api/admin/profiles"],
    enabled: !!user && (user.role === "admin" || user.role === "superuser"),
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Handle city filter change
  const handleCityChange = (value: string) => {
    setFilters({ ...filters, city: value });
  };

  // Handle date filter changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, endDate: e.target.value });
  };

  // Filter students based on filters
  const filteredStudents = students ? students.filter((student: Profile) => {
    // Search filter (name or document)
    const searchMatch = !filters.search || 
      student.full_name.toLowerCase().includes(filters.search.toLowerCase()) || 
      student.document_number.toLowerCase().includes(filters.search.toLowerCase());
    
    // City filter
    const cityMatch = !filters.city || student.city === filters.city;
    
    // Date filter (created_at)
    const dateMatch = (!filters.startDate || new Date(student.created_at) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(student.created_at) <= new Date(filters.endDate));
    
    return searchMatch && cityMatch && dateMatch;
  }) : [];

  // Get unique cities for filter dropdown
  const cities = students ? [...new Set(students.map((student: Profile) => student.city))].sort() : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Estudiantes</CardTitle>
        <CardDescription>
          Consulta y administra la información de los estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-grow">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por nombre o documento"
                className="pl-10"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="sm:w-40">
            <Select 
              value={filters.city} 
              onValueChange={handleCityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las ciudades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las ciudades</SelectItem>
                {cities.map((city: string) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="sm:w-48">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="Desde"
                  value={filters.startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="Hasta"
                  value={filters.endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !students || students.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay estudiantes registrados</h3>
            <p className="mt-2 text-sm text-gray-500">
              No se encontraron estudiantes en el sistema.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: Profile) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>
                      {student.document_type === "cedula" ? "CC" : 
                       student.document_type === "pasaporte" ? "PS" : "TE"}: {student.document_number}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.city}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <Link href={`/admin/students/${student.id}`}>
                        <Button variant="link">Ver detalles</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
