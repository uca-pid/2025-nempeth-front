import api from './api';
import { AxiosError } from 'axios';

export interface EditUserProfileData {
  name: string;
  lastname: string;
}

export interface EditUserProfileResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    lastname: string;
    email: string;
  };
}

export const editUserProfile = async (
  userId: number | string,
  profileData: EditUserProfileData,
): Promise<EditUserProfileResponse> => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);

    return {
      success: true,
      message: 'Perfil actualizado correctamente',
      user: response.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar el perfil';
      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: false,
      message: 'Error inesperado al actualizar el perfil',
    };
  }
};
