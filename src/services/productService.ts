import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

export const productService = {
  getProducts: async (businessId: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/businesses/${businessId}/products`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  createProduct: async (
    businessId: string,
    productData: CreateProductRequest,
  ): Promise<Product> => {
    try {
      const response = await api.post(
        `/businesses/${businessId}/products`,
        productData,
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  updateProduct: async (
    businessId: string,
    productId: string,
    productData: UpdateProductRequest,
  ): Promise<Product> => {
    try {
      const response = await api.put(
        `/businesses/${businessId}/products/${productId}`,
        productData,
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  deleteProduct: async (
    businessId: string,
    productId: string,
  ): Promise<void> => {
    try {
      await api.delete(`/businesses/${businessId}/products/${productId}`);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  },
};

export default productService;
