import { Link, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/use-auth';
import { User, Group, Inbox, File, MessageCircleQuestion, LogOut, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const userRole = user?.user_metadata?.role || 'estudiante';
  
  return (
    <div className="bg-white shadow-lg md:w-64 flex-shrink-0 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">Portal Estudiante</h1>
        <p className="text-gray-500 text-sm">v1.0</p>
      </div>
      
      <div className="py-4 flex flex-col h-full">
        <div className="px-4 mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.user_metadata?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1">
          {/* Student Links - visible to all roles */}
          <div className="px-2 space-y-1">
            <Link
              to="/profile"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/profile')
                  ? 'bg-primary-50 text-primary-600 border-l-3 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User className="mr-3 h-5 w-5 text-gray-500" />
              Mi Perfil
            </Link>
            <Link
              to="/documents"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/documents')
                  ? 'bg-primary-50 text-primary-600 border-l-3 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <File className="mr-3 h-5 w-5 text-gray-500" />
              Mis Documentos
            </Link>
            <Link
              to="/requests"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/requests')
                  ? 'bg-primary-50 text-primary-600 border-l-3 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MessageCircleQuestion className="mr-3 h-5 w-5 text-gray-500" />
              Mis Solicitudes
            </Link>
          </div>
          
          {/* Admin Links - visible to admin and superuser */}
          {(userRole === 'admin' || userRole === 'superuser') && (
            <div className="px-2 pt-5 pb-2">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administración
              </h3>
              <div className="mt-2 space-y-1">
                <Link
                  to="/admin/students"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname.startsWith('/admin/students')
                      ? 'bg-primary-50 text-primary-600 border-l-3 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Group className="mr-3 h-5 w-5 text-gray-500" />
                  Estudiantes
                </Link>
                <Link
                  to="/admin/requests"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/requests')
                      ? 'bg-primary-50 text-primary-600 border-l-3 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Inbox className="mr-3 h-5 w-5 text-gray-500" />
                  Solicitudes
                </Link>
              </div>
            </div>
          )}
          
          {/* Superuser Links - visible only to superuser */}
          {userRole === 'superuser' && (
            <div className="px-2 pt-5 pb-2">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sistema
              </h3>
              <div className="mt-2 space-y-1">
                <Link
                  to="/admin/users"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/users')
                      ? 'bg-primary-50 text-primary-600 border-l-3 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-500" />
                  Usuarios
                </Link>
              </div>
            </div>
          )}
        </nav>
        
        {/* Logout button */}
        <div className="px-4 mt-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
