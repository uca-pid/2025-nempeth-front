import api from './api'

interface MonthlyRevenueResponse {
  month: string
  revenue: number
}

interface MonthlyProfitResponse {
  month: string
  profit: number
}

interface RevenueByCategoryResponse {
  month: string
  categoryName: string
  revenue: number
}

interface ProfitByCategoryResponse {
  month: string
  categoryName: string
  profit: number
}

export const analyticsService = {
  getMonthlyRevenue: async (businessId: string): Promise<MonthlyRevenueResponse[]> => {
    const response = await api.get(`/businesses/${businessId}/analytics/revenue/total`)
    return response.data
  },
  
  getMonthlyProfit: async (businessId: string): Promise<MonthlyProfitResponse[]> => {
    const response = await api.get(`/businesses/${businessId}/analytics/profit/total`)
    return response.data
  },

  getRevenueByCategoryAllMonths: async (businessId: string): Promise<RevenueByCategoryResponse[]> => {
    const response = await api.get(`/businesses/${businessId}/analytics/revenue/by-category`)
    return response.data
  },

  getProfitByCategoryAllMonths: async (businessId: string): Promise<ProfitByCategoryResponse[]> => {
    const response = await api.get(`/businesses/${businessId}/analytics/profit/by-category`)
    return response.data
  }
}