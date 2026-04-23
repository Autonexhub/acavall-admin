import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important: Send cookies with requests
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        // Extract error message from response body
        const errorMessage = error.response?.data?.error || error.message;

        // Translate common error messages to Spanish
        const translatedMessage = this.translateError(errorMessage);

        if (error.response?.status === 401) {
          // Unauthorized - redirect to login (except if already on login page)
          if (typeof window !== 'undefined' &&
              !window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/reset-password') &&
              !window.location.pathname.includes('/forgot-password')) {
            window.location.href = '/login';
          }
        }

        // Create a new error with the translated message
        const enhancedError = new Error(translatedMessage);
        (enhancedError as any).status = error.response?.status;
        (enhancedError as any).originalError = error;
        return Promise.reject(enhancedError);
      }
    );
  }

  private translateError(message: string): string {
    const translations: Record<string, string> = {
      'Invalid credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
      'Email and password are required': 'El email y la contraseña son obligatorios.',
      'User not found': 'Usuario no encontrado.',
      'Invalid or expired token': 'El enlace ha expirado o no es válido.',
      'Password must be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      'Email is required': 'El email es obligatorio.',
      'Token is required': 'Token no proporcionado.',
      'Request failed': 'Error en la solicitud.',
    };
    return translations[message] || message;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed');
    }
    return response.data.data as T;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed');
    }
    return response.data.data as T;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed');
    }
    return response.data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed');
    }
    return response.data.data as T;
  }
}

export const apiClient = new ApiClient();
