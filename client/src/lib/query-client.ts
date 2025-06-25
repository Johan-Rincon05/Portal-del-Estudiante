import { QueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

// Función para obtener el token JWT del localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Función para guardar el token JWT en localStorage
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Función para eliminar el token JWT
export const removeToken = () => {
  localStorage.removeItem('token');
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Construir la URL correctamente sin duplicar /api
  let url: string;
  if (endpoint.startsWith('/api/')) {
    // Si ya empieza con /api/, usar directamente
    url = `${API_BASE_URL}${endpoint.substring(4)}`;
  } else if (endpoint.startsWith('/')) {
    // Si empieza con / pero no con /api/, agregar /api
    url = `${API_BASE_URL}${endpoint}`;
  } else {
    // Si no empieza con /, agregar /api/
    url = `${API_BASE_URL}/${endpoint}`;
  }
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  // Obtener el token si existe
  const token = getToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
    console.log('Token encontrado y agregado al header:', token.substring(0, 20) + '...');
  } else {
    console.log('No se encontró token en localStorage');
  }

  console.log('API Request URL:', url); // Debug log
  console.log('Headers:', defaultHeaders); // Debug log

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include",
    mode: "cors"
  });

  console.log('Response status:', response.status); // Debug log

  if (!response.ok) {
    if (response.status === 401) {
      // Si recibimos un 401, eliminamos el token
      console.log('Recibido 401, eliminando token');
      removeToken();
    }
    const error = await response.json();
    console.log('Error response:', error); // Debug log
    throw new Error(error.error || error.message || 'Ocurrió un error en la solicitud');
  }

  const data = await response.json();
  console.log('Response data:', data); // Debug log
  return data;
}

// Función para obtener datos con manejo de errores
export const getQueryFn = ({ on401 = "throw" }: { on401?: "throw" | "returnNull" } = {}) => {
  return async <T>({ queryKey }: { queryKey: string[] }): Promise<T> => {
    try {
      return await apiRequest<T>(queryKey[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("401") && on401 === "returnNull") {
        return null as T;
      }
      throw error;
    }
  };
}; 