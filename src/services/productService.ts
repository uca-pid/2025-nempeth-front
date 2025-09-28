import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
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
    ownerId: string,
    productData: CreateProductRequest,
  ): Promise<Product> => {
    try {
      const response = await api.post(
        `/products?ownerId=${ownerId}`,
        productData,
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  updateProduct: async (
    productId: string,
    ownerId: string,
    productData: UpdateProductRequest,
  ): Promise<Product> => {
    try {
      const response = await api.put(
        `/products/${productId}?ownerId=${ownerId}`,
        productData,
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  deleteProduct: async (productId: string, ownerId: string): Promise<void> => {
    try {
      await api.delete(`/products/${productId}?ownerId=${ownerId}`);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  },
};

export default productService;
