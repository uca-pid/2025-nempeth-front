import { createContext } from 'react';
import type { LoginRequest, LoginResponse } from '../services/loginService';

// Interface para los datos del usuario decodificados del token
export interface User {
  userId: string;
  email: string;
  role: 'OWNER' | 'USER';
  // Puedes agregar más campos cuando los tengas disponibles desde el backend
  name?: string;
  lastName?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
