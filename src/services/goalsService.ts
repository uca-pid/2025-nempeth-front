import api from './api';

export interface ActiveGoalSummaryResponse {
  id: string;
  name: string;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  daysRemaining: string;
  categoriesCompleted: number;
  categoriesTotal: number;
  completionStatus: string;
  totalTarget: number;
  totalActual: number;
}

export interface GoalCategoryTargetResponse {
  id: string;
  categoryId: string;
  categoryName: string;
  revenueTarget: number;
  actualRevenue: number;
  achievement: number;
}

export interface GoalReportResponse {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  totalRevenueGoal: number;
  totalActualRevenue: number;
  totalAchievement: number;
  categoryTargets: GoalCategoryTargetResponse[];
}

export interface CategoryTargetRequest {
  categoryId: string;
  revenueTarget: number;
}

export interface CreateGoalRequest {
  name: string;
  periodStart: string;
  periodEnd: string;
  totalRevenueGoal: number;
  categoryTargets: CategoryTargetRequest[];
}

export interface CreateGoalResponse {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  totalRevenueGoal: number;
  categoryTargets: GoalCategoryTargetResponse[];
}

export interface UpdateGoalRequest {
  name: string;
  periodStart: string;
  periodEnd: string;
  totalRevenueGoal: number;
  categoryTargets: CategoryTargetRequest[];
}

export const GoalsService = {
  /**
   * Obtiene el resumen de todas las metas activas de un negocio
   */
  getActiveGoalsSummary: async (businessId: string): Promise<ActiveGoalSummaryResponse[]> => {
    try {
      const response = await api.get<ActiveGoalSummaryResponse[]>(
        `/businesses/${businessId}/goals/summary`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching goals summary:', error);
      throw error;
    }
  },

  /**
   * Obtiene el reporte detallado de una meta específica
   */
  getGoalReport: async (businessId: string, goalId: string): Promise<GoalReportResponse> => {
    try {
      const response = await api.get<GoalReportResponse>(
        `/businesses/${businessId}/goals/${goalId}/report`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching goal report:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva meta para un negocio
   */
  createGoal: async (businessId: string, goalData: CreateGoalRequest): Promise<CreateGoalResponse> => {
    try {
      const response = await api.post<CreateGoalResponse>(
        `/businesses/${businessId}/goals`,
        goalData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  /**
   * Actualiza una meta existente
   */
  updateGoal: async (businessId: string, goalId: string, goalData: UpdateGoalRequest): Promise<GoalReportResponse> => {
    try {
      const response = await api.put<GoalReportResponse>(
        `/businesses/${businessId}/goals/${goalId}`,
        goalData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  /**
   * Elimina una meta existente
   */
  deleteGoal: async (businessId: string, goalId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(
        `/businesses/${businessId}/goals/${goalId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },
};
