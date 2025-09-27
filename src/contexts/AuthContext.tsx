import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/loginService';
import type { LoginRequest, LoginResponse } from '../services/loginService';
import { AuthContext, type User } from './AuthContextTypes';
import api from '../services/api'; // Para uso futuro
// import api from '../services/api'; // Para uso futuro

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(!!user && !!token);
  }, [user, token]);

  // Función para decodificar el JWT y extraer la información del usuario
  const decodeToken = (token: string): User | null => {
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

      return {
        userId: decoded.userId,
        email: decoded.sub, // El 'sub' generalmente contiene el email
        role: decoded.role,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Verificar token al cargar la app
  useEffect(() => {
    const storedToken = AuthService.getToken();
    const init = async () => {
      if (storedToken) {
        const userData = decodeToken(storedToken);
        if (userData) {
          setToken(storedToken);
          setUser(userData);
          // Si no hay name/lastName, forzar fetch del perfil
          if (!userData.name || !userData.lastName) {
            try {
              const response = await api.get('/users/me', { headers: { Authorization: `Bearer ${storedToken}` } });
              if (response.data) {
                setUser(prev => prev ? { ...prev, ...response.data } : null);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
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

  //Opcional: Función para obtener más datos del usuario desde el backend
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });

      if (response.data) {
        setUser(prev => prev ? { ...prev, ...response.data } : null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
  };

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(credentials);
      
      if (response.token) {
        const userData = decodeToken(response.token);
        if (userData) {
          setToken(response.token);
          setUser(userData);
          console.log('userData:', userData);
          setIsAuthenticated(true);

          // Opcionalmente, obtener más datos del usuario
            await fetchUserProfile();
          
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
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


