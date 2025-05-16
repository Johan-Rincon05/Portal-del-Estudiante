import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  // Mock user data - this would be replaced with actual data from Supabase
  const userData = {
    id: userId,
    name: 'Carlos Rodríguez',
    email: 'carlos@ejemplo.com',
    role: 'estudiante',
    status: 'active',
    createdAt: '2023-03-12',
    lastLogin: '2023-04-15'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detalles del Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
            <p className="text-lg font-semibold">{userData.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Correo Electrónico</h3>
            <p className="text-lg font-semibold">{userData.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Rol</h3>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {userData.role}
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {userData.status}
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Creado</h3>
            <p className="text-lg font-semibold">{userData.createdAt}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Último Acceso</h3>
            <p className="text-lg font-semibold">{userData.lastLogin}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetailsPage; 