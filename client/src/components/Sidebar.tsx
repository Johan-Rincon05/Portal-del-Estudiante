import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { User, Group, Inbox, File, MessageCircleQuestion, LogOut, Settings, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const Sidebar = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActive = (path: string) => location === path;
  
  const userRole = user?.role || 'estudiante';
  
  return (
    <div className="bg-sidebar shadow-lg md:w-64 flex-shrink-0 border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border flex items-center justify-center">
        {/* Logo ETC según el manual de marca */}
        <div className="flex flex-col items-center">
          <div className="text-white text-2xl font-bold mb-1">
            <div className="flex flex-col">
              <div className="flex items-center">
                <div className="h-1 w-10 bg-white mr-1"></div>
                <div className="h-1 w-6 bg-white"></div>
              </div>
              <div className="mt-1 h-1 w-6 bg-white"></div>
              <div className="mt-1 h-1 w-6 bg-white"></div>
            </div>
          </div>
          <h1 className="text-sm font-semibold text-white tracking-wide">PORTAL DEL ESTUDIANTE</h1>
        </div>
      </div>
      
      <div className="py-4 flex flex-col h-full">
        <div className="px-4 mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-sidebar-accent/20 flex items-center justify-center text-sidebar-accent">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.username || 'Usuario'}
              </p>
              <p className="text-xs text-sidebar-accent">{userRole}</p>
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
                  ? 'bg-sidebar-accent/30 text-white border-l-2 border-white'
                  : 'text-white/90 hover:bg-sidebar-accent/20 hover:text-white'
              }`}
            >
              <User className={`mr-3 h-5 w-5 ${isActive('/profile') ? 'text-white' : 'text-white/80'}`} />
              Mi Perfil
            </Link>
            <Link
              to="/documents"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/documents')
                  ? 'bg-sidebar-accent/30 text-white border-l-2 border-white'
                  : 'text-white/90 hover:bg-sidebar-accent/20 hover:text-white'
              }`}
            >
              <File className={`mr-3 h-5 w-5 ${isActive('/documents') ? 'text-white' : 'text-white/80'}`} />
              Mis Documentos
            </Link>
            <Link
              to="/payments"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/payments')
                  ? 'bg-sidebar-accent/30 text-white border-l-2 border-white'
                  : 'text-white/90 hover:bg-sidebar-accent/20 hover:text-white'
              }`}
            >
              <CreditCard className={`mr-3 h-5 w-5 ${isActive('/payments') ? 'text-white' : 'text-white/80'}`} />
              Mis Pagos
            </Link>
            <Link
              to="/requests"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/requests')
                  ? 'bg-sidebar-accent/30 text-white border-l-2 border-white'
                  : 'text-white/90 hover:bg-sidebar-accent/20 hover:text-white'
              }`}
            >
              <MessageCircleQuestion className={`mr-3 h-5 w-5 ${isActive('/requests') ? 'text-white' : 'text-white/80'}`} />
              Mis Solicitudes
            </Link>
          </div>
          
          {/* Admin Links - visible to admin and superuser */}
          {(userRole === 'admin' || userRole === 'superuser') && (
            <div className="px-2 pt-5 pb-2">
              <h3 className="px-2 text-xs font-semibold text-white uppercase tracking-wider">
                Administración
              </h3>
              <div className="mt-2 space-y-1">
                <Link
                  to="/admin/students"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.startsWith('/admin/students')
                      ? 'bg-sidebar-accent/30 text-white border-l-2 border-white'
                      : 'text-white/90 hover:bg-sidebar-accent/20 hover:text-white'
                  }`}
                >
                  <Group className={`mr-3 h-5 w-5 ${location.startsWith('/admin/students') ? 'text-white' : 'text-white/80'}`} />
                  Estudiantes
                </Link>
                <Link
                  to="/admin/requests"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/requests')
                      ? 'bg-sidebar-accent/30 text-white border-l-2 border-white'
                      : 'text-white/90 hover:bg-sidebar-accent/20 hover:text-white'
                  }`}
                >
                  <Inbox className={`mr-3 h-5 w-5 ${isActive('/admin/requests') ? 'text-white' : 'text-white/80'}`} />
                  Solicitudes
                </Link>
              </div>
            </div>
          )}
          
          {/* Superuser Links - visible only to superuser */}
          {userRole === 'superuser' && (
            <div className="px-2 pt-5 pb-2">
              <h3 className="px-2 text-xs font-semibold text-white uppercase tracking-wider">
                Sistema
              </h3>
              <div className="mt-2 space-y-1">
                <Link
                  to="/admin/users"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/users')
                      ? 'bg-sidebar-accent/30 text-white border-l-2 border-white'
                      : 'text-white/90 hover:bg-sidebar-accent/20 hover:text-white'
                  }`}
                >
                  <Settings className={`mr-3 h-5 w-5 ${isActive('/admin/users') ? 'text-white' : 'text-white/80'}`} />
                  Usuarios
                </Link>
              </div>
            </div>
          )}
        </nav>
        
        {/* Logout button */}
        <div className="px-4 mt-6 mb-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-white/90 hover:bg-sidebar-accent/30 hover:text-white rounded-md transition-colors"
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
