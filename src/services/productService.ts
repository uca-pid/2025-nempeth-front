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
  // Obtener todos los productos de un owner
  getProducts: async (ownerId: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/products?ownerId=${ownerId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Crear un nuevo producto
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

  // Actualizar un producto existente
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

  // Eliminar un producto
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
