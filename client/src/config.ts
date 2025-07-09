// Configuración de la URL base de la API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : '/api'; // Usar proxy de Vite en desarrollo 