import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '@/hooks/use-profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, UserCircle } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const StudentsPage = () => {
  const { allProfiles, isLoading } = useProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Apply filters
  const filteredProfiles = allProfiles?.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !cityFilter || profile.city.toLowerCase() === cityFilter.toLowerCase();
    
    const createdAtDate = new Date(profile.createdAt);
    const matchesDateFrom = !dateFromFilter || createdAtDate >= new Date(dateFromFilter);
    const matchesDateTo = !dateToFilter || createdAtDate <= new Date(dateToFilter);
    
    return matchesSearch && matchesCity && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = filteredProfiles ? Math.ceil(filteredProfiles.length / itemsPerPage) : 0;
  const paginatedProfiles = filteredProfiles?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterApply = () => {
    setCurrentPage(1);
  };

  // Extract unique cities for filter dropdown
  const uniqueCities = [...new Set(allProfiles?.map(profile => profile.city) || [])];

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Lista de Estudiantes</h2>
        <p className="text-sm text-gray-500">Gestiona los perfiles de estudiantes registrados</p>
      </div>
      
      {/* Filters */}
      <Card className="p-4 mb-6">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Buscar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Buscar por nombre o documento"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <div className="w-full md:w-40">
                <label htmlFor="city" className="sr-only">Ciudad</label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las ciudades</SelectItem>
                    {uniqueCities.map((city, index) => (
                      <SelectItem key={index} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-40">
                <label htmlFor="date-from" className="sr-only">Desde</label>
                <Input
                  type="date"
                  id="date-from"
                  name="date-from"
                  placeholder="Desde"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-40">
                <label htmlFor="date-to" className="sr-only">Hasta</label>
                <Input
                  type="date"
                  id="date-to"
                  name="date-to"
                  placeholder="Hasta"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
              
              <Button onClick={handleFilterApply}>
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Students table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : paginatedProfiles && paginatedProfiles.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha registro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitudes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                          <UserCircle className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{profile.fullName}</div>
                          <div className="text-sm text-gray-500">{profile.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {profile.documentType === 'cedula' ? 'Cédula' : 
                         profile.documentType === 'pasaporte' ? 'Pasaporte' : 
                         'Tarjeta de identidad'}
                      </div>
                      <div className="text-sm text-gray-500">{profile.documentNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{profile.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {profile.documentCount || 0} documentos
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {profile.pendingRequestCount || 0} pendientes
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/students/${profile.id}`} 
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-10 text-center">
              <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estudiantes</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron estudiantes con los filtros aplicados.
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredProfiles?.length || 0)}
                  </span>{' '}
                  de <span className="font-medium">{filteredProfiles?.length}</span> resultados
                </p>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default StudentsPage;
