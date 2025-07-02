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
  // Construir la URL de manera más simple y clara
  let url: string;
  
  // Si el endpoint ya incluye la URL completa, usarlo directamente
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else {
    // Remover /api/ si está presente para evitar duplicación
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    // Asegurar que empiece con /
    const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    url = `${API_BASE_URL}${normalizedEndpoint}`;
  }
  
  const defaultHeaders: Record<string, string> = {
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  // Solo establecer Content-Type si no es FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Obtener el token si existe y agregarlo a los headers
  const token = getToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include",
    mode: "cors"
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Si recibimos un 401, eliminamos el token
      removeToken();
    }
    const error = await response.json();
    throw new Error(error.error || error.message || 'Ocurrió un error en la solicitud');
  }

  const data = await response.json();
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