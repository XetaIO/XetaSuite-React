import { handleApiError } from '@/shared/api';
import type { UpdatePasswordData, UpdatePasswordResponse } from '../types';
import type { ManagerResult } from '@/shared/types';
import { AccountRepository } from './AccountRepository';


/**
 * Account Manager - Business logic and error handling layer
 */
export const AccountManager = {
    /**
     * Update user password with error handling
     */
    updatePassword: async (data: UpdatePasswordData): Promise<ManagerResult<UpdatePasswordResponse>> => {
        try {
            const response = await AccountRepository.updatePassword(data);
            return {
                success: true,
                data: response,
            };
        } catch (error: unknown) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
