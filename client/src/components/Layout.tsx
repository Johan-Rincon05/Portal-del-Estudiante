import React from 'react';
import { Sidebar } from './Sidebar';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Bell } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const pageTitles: Record<string, string> = {
    '/profile': 'Mi Perfil',
    '/documents': 'Mis Documentos',
    '/requests': 'Mis Solicitudes',
    '/admin/students': 'Lista de Estudiantes',
    '/admin/requests': 'Gestión de Solicitudes',
    '/admin/users': 'Gestión de Usuarios'
  };

  // Handle dynamic routes with parameters
  const currentPath = location.pathname;
  let pageTitle = pageTitles[currentPath] || '';
  
  if (currentPath.startsWith('/admin/students/') && currentPath !== '/admin/students') {
    pageTitle = 'Detalle de Estudiante';
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            <div className="flex items-center">
              {/* Notifications */}
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none relative mr-4">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* Mobile menu button */}
              <button 
                type="button" 
                className="md:hidden ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
