import api from './api'

export interface SaleItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SaleResponse {
  id: string
  occurredAt: string
  totalAmount: number
  createdByUserName: string
  items: SaleItemResponse[]
}

export const salesManagementService = {
  async getAllSales(businessId: string): Promise<SaleResponse[]> {
    try {
      const response = await api.get(`/businesses/${businessId}/sales`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales:', error)
      throw error
    }
  },

  async getSaleById(businessId: string, saleId: string): Promise<SaleResponse> {
    try {
      const response = await api.get(`/businesses/${businessId}/sales/${saleId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sale details:', error)
      throw error
    }
  }
}