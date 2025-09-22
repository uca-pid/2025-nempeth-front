import api from './api';

export interface UpdateProfileRequest {
  name: string;
  lastName: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  static async updateProfile(
    userId: string | undefined,
    data: UpdateProfileRequest,
  ) {
    const response = await api.put(`/users/${userId}/profile`, data);
    return response.data;
  }

  static async updatePassword(
    userId: string | undefined,
    data: UpdatePasswordRequest,
  ) {
    const response = await api.put(`/users/${userId}/password`, data);
    return response.data;
  }

  static async deleteAccount(userId: string | undefined) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
}
