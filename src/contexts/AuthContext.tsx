import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/loginService';
import type { LoginRequest, LoginResponse } from '../services/loginService';
import { AuthContext, type User } from './AuthContextTypes';
import api from '../services/api';

// Función helper para decodificar el JWT y extraer información básica del usuario
const decodeToken = (token: string): { userId: string; email: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    
    // Verifica si el token no ha expirado
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return null; // Token expirado
    } 
    
    // Solo retornamos los datos que sabemos que están en el token
    return {
      userId: decoded.userId,
      email: decoded.sub, // El 'sub' generalmente contiene el email
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Función helper para obtener todos los datos del usuario desde el backend
const fetchCompleteUserData = async (authToken: string): Promise<User | null> => {
  try {
    const response = await api.get('/users/me', { 
      headers: { Authorization: `Bearer ${authToken}` } 
    });

    if (response.data) {
      const basicData = decodeToken(authToken);
      if (!basicData) return null;

      console.log("Aca",response);
      

      return {
        userId: basicData.userId,
        email: basicData.email,
        name: response.data.name,
        lastName: response.data.lastName,
        businessId: response.data.businesses[0].businessId,
        businessName: response.data.businesses[0].businessName,
        role: response.data.businesses[0].role,
        status: response.data.businesses[0].status
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching complete user data:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(!!user && !!token);
  }, [user, token]);

  // Verificar token al cargar la app y obtener datos completos del usuario
  useEffect(() => {
    const storedToken = AuthService.getToken();
    const init = async () => {
      if (storedToken) {
        const basicUserData = decodeToken(storedToken);
        if (basicUserData) {
          setToken(storedToken);
          
          // Obtener datos completos del usuario desde el backend
          const completeUserData = await fetchCompleteUserData(storedToken);
          if (completeUserData) {
            setUser(completeUserData);
          } else {
            // Si no se pueden obtener los datos completos, limpiar todo
            AuthService.logout();
          }
        } else {
          // Token inválido o expirado
          AuthService.logout();
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(credentials);
      
      if (response.token) {
        const basicUserData = decodeToken(response.token);
        if (basicUserData) {
          setToken(response.token);
          
          // Obtener datos completos del usuario antes de marcar como autenticado
          const completeUserData = await fetchCompleteUserData(response.token);
          if (completeUserData) {
            setUser(completeUserData);
            console.log('Complete user data loaded:', completeUserData);
          } else {
            // Si no se pueden obtener los datos completos, fallar el login
            throw new Error('No se pudieron cargar los datos completos del usuario');
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Limpiar estado en caso de error
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


