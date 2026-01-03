import { httpClient, API_ENDPOINTS } from '@/shared/api';
import type { UpdatePasswordData, UpdatePasswordResponse } from '../types';

/**
 * Account Repository - Responsible for interacting with user account data source
 */
export const AccountRepository = {
    /**
     * Update user password
     */
    updatePassword: async (data: UpdatePasswordData): Promise<UpdatePasswordResponse> => {
        const response = await httpClient.put<UpdatePasswordResponse>(
            API_ENDPOINTS.USER.PASSWORD,
            data
        );
        return response.data;
    },
};
