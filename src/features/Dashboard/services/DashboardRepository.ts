/**
 * Dashboard Repository
 * Handles API calls for dashboard data
 */
import { httpClient } from '@/shared/api';
import type { DashboardData, ChartsData } from '../types';

const API_PREFIX = '/api/v1';

export const DashboardRepository = {
    /**
     * Get dashboard statistics and data
     */
    getStats: async (): Promise<DashboardData> => {
        const response = await httpClient.get<DashboardData>(`${API_PREFIX}/dashboard/stats`);
        return response.data;
    },

    /**
     * Get charts data (maintenances/incidents evolution)
     */
    getChartsData: async (): Promise<ChartsData> => {
        const response = await httpClient.get<ChartsData>(`${API_PREFIX}/dashboard/charts`);
        return response.data;
    },
};
