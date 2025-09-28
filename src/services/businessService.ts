import api from './api'

export interface BusinessMemberDetailResponse {
  userId: string
  email: string
  name: string
  lastName: string
  role: string
  status: string
}

export interface CategoryResponse {
  id: string
  name: string
  icon: string
  type: string
}

export interface ProductResponse {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
}

export interface BusinessStatsResponse {
  totalProducts: number
  totalCategories: number
  totalMembers: number
}

export interface BusinessDetailResponse {
  id: string
  name: string
  joinCode: string
  joinCodeEnabled: boolean
  members: BusinessMemberDetailResponse[]
  categories: CategoryResponse[]
  products: ProductResponse[]
  stats: BusinessStatsResponse
}

export const businessService = {
  getBusinessDetail: async (businessId: string): Promise<BusinessDetailResponse> => {
    try {
      const response = await api.get(`/businesses/${businessId}/detail`)
      return response.data
    } catch (error) {
      console.error('Error al obtener detalles del negocio:', error)
      throw error
    }
  }
}