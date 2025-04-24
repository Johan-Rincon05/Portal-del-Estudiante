import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || res.statusText;
    } catch {
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const path = url.startsWith('/') ? url : `/${url}`;
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  try {
    console.log(`Realizando petición a ${API_BASE_URL}${path}`);
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include",
      mode: "cors",
      cache: "no-store"
    });

    console.log(`Respuesta recibida: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('Error en la petición:', errorData);
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error en apiRequest:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const path = url.startsWith('/') ? url : `/${url}`;
    
    const res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
