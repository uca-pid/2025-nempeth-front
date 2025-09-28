import api from './api'

export interface CreateSaleItemRequest {
  productId: string
  quantity: number
}

export interface CreateSaleRequest {
  items: CreateSaleItemRequest[]
}

export interface Sale {
  id: string
  businessId: string
  items: CreateSaleItemRequest[]
  createdAt: string
  total?: number
}

export const salesService = {
  async createSale(businessId: string, saleData: CreateSaleRequest): Promise<Sale> {
    try {
      const response = await api.post(`/businesses/${businessId}/sales`, saleData)
      return response.data
    } catch (error) {
      console.error('Error creating sale:', error)
      throw error
    }
  }
}