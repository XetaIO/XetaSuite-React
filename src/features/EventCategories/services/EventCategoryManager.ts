import { handleApiError } from '@/shared/api';
import type { PaginatedResponse, ManagerResult } from '@/shared/types';
import { EventCategoryRepository } from './EventCategoryRepository';
import type { EventCategory, EventCategoryFormData, EventCategoryFilters } from '../types';

/**
 * Event Category Manager - Business logic with error handling
 */
export const EventCategoryManager = {
    getAll: async (filters?: EventCategoryFilters): Promise<ManagerResult<PaginatedResponse<EventCategory>>> => {
        try {
            const data = await EventCategoryRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    getById: async (id: number): Promise<ManagerResult<EventCategory>> => {
        try {
            const response = await EventCategoryRepository.getById(id);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    create: async (data: EventCategoryFormData): Promise<ManagerResult<EventCategory>> => {
        try {
            const response = await EventCategoryRepository.create(data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    update: async (id: number, data: Partial<EventCategoryFormData>): Promise<ManagerResult<EventCategory>> => {
        try {
            const response = await EventCategoryRepository.update(id, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await EventCategoryRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
