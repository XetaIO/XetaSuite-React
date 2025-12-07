import { httpClient, API_ENDPOINTS } from '@/shared/api';
import type { QrScanResponse } from '@/features/Qrcode/types';

export const QrScanRepository = {
    /**
     * Get scanned material information
     */
    getMaterial: async (id: number): Promise<QrScanResponse> => {
        const response = await httpClient.get<QrScanResponse>(API_ENDPOINTS.QR_SCAN.MATERIAL(id));
        return response.data;
    },

    /**
     * Get scanned item information
     */
    getItem: async (id: number): Promise<QrScanResponse> => {
        const response = await httpClient.get<QrScanResponse>(API_ENDPOINTS.QR_SCAN.ITEM(id));
        return response.data;
    },
};
