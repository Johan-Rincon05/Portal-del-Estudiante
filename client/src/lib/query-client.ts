import { QueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include",
    mode: "cors"
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ocurrió un error en la solicitud');
  }

  return response.json();
} 