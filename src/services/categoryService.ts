import api from './api';

export interface Category {
  id: string;
  name: string;
  displayName: string;
  icon: string;
}

export interface CreateCategoryRequest {
  name: string;
  displayName: string;
  icon: string;
}

export interface UpdateCategoryRequest {
  name: string;
  displayName: string;
  icon: string;
}

export const categoryService = {
  getCategories: async (businessId: string): Promise<Category[]> => {
    try {
      const response = await api.get(`/businesses/${businessId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  createCategory: async (
    businessId: string,
    category: CreateCategoryRequest,
  ): Promise<Category> => {
    try {
      const response = await api.post(
        `/businesses/${businessId}/categories`,
        category,
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },

  updateCategory: async (
    businessId: string,
    categoryId: string,
    category: UpdateCategoryRequest,
  ): Promise<Category> => {
    try {
      const response = await api.put(
        `/businesses/${businessId}/categories/${categoryId}`,
        category,
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },

  deleteCategory: async (
    businessId: string,
    categoryId: string,
  ): Promise<void> => {
    try {
      await api.delete(`/businesses/${businessId}/categories/${categoryId}`);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  },
};
