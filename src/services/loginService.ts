import api from './api';
import { AxiosError } from 'axios';

// Interfaces para las requests y responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
}

// Servicio de autenticación
export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        credentials,
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Error en login:', error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new Error('Credenciales incorrectas');
        } else if (error.response?.status === 500) {
          throw new Error('Error del servidor. Intenta más tarde');
        } else if (!error.response) {
          throw new Error('No se pudo conectar con el servidor');
        } else {
          throw new Error('Error inesperado en el login');
        }
      } else {
        throw new Error('Error inesperado en el login');
      }
    }
  }

  // Método para register (para uso futuro)
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>(
        '/auth/register',
        userData,
      );
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          throw new Error('El email ya está registrado');
        } else if (error.response?.status === 400) {
          throw new Error('Datos inválidos para el registro');
        } else if (error.response?.status === 500) {
          throw new Error('Error del servidor. Intenta más tarde');
        } else if (!error.response) {
          throw new Error('No se pudo conectar con el servidor');
        } else {
          throw new Error('Error inesperado en el registro');
        }
      } else {
        throw new Error('Error inesperado en el registro');
      }
    }
  }

  // Método para logout
  static logout(): void {
    localStorage.removeItem('token');
  }

  // Método para verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  // Método para obtener el token actual
  static getToken(): string | null {
    return localStorage.getItem('token');
  }
}
