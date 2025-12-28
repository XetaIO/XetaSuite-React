import { handleApiError } from "@/shared/api";
import type { QrScanData } from "@/features/Qrcode/types";
import type { ManagerResult } from "@/shared/types";
import { QrScanRepository } from "./QrScanRepository";

export const QrScanManager = {
    /**
     * Get scanned material information with error handling
     */
    getMaterial: async (id: number): Promise<ManagerResult<QrScanData>> => {
        try {
            const response = await QrScanRepository.getMaterial(id);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get scanned item information with error handling
     */
    getItem: async (id: number): Promise<ManagerResult<QrScanData>> => {
        try {
            const response = await QrScanRepository.getItem(id);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};