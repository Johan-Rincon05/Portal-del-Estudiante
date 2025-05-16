import axios, { AxiosResponse, AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Manejar error de autenticación
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 