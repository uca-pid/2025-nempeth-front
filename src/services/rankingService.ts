import api from './api'

export interface EmployeeRankingResponse {
  name: string
  lastName: string
  sales: number
  revenue: number
  position: number
  currentUser: boolean
}

export interface BusinessRankingResponse {
  businessId: string
  businessName: string
  score: number
  position: number
  isOwnBusiness: boolean
}

export const rankingService = {
  getEmployeeRankings: async (businessId: string): Promise<EmployeeRankingResponse[]> => {
    const response = await api.get(`/businesses/${businessId}/rankings/employees`)
    return response.data
  },

  getBusinessRankings: async (businessId: string): Promise<BusinessRankingResponse[]> => {
    const response = await api.get(`/businesses/${businessId}/rankings/businesses`)
    return response.data
  }
}
