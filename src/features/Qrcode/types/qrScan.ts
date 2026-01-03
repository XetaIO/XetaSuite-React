export interface QrScanSite {
    id: number;
    name: string;
}

export interface QrScanZone {
    id: number;
    name: string;
}

export type MaterialScanAction = 'cleaning' | 'maintenance' | 'incident';
export type ItemScanAction = 'entry' | 'exit';

export interface QrScanMaterialData {
    type: 'material';
    id: number;
    name: string;
    description: string | null;
    site: QrScanSite | null;
    zone: QrScanZone | null;
    available_actions: MaterialScanAction[];
}

export interface QrScanItemData {
    type: 'item';
    id: number;
    name: string;
    reference: string | null;
    description: string | null;
    current_stock: number;
    site: QrScanSite | null;
    available_actions: ItemScanAction[];
}

export type QrScanData = QrScanMaterialData | QrScanItemData;

export interface QrScanResponse {
    data: QrScanData;
}

export interface QrScanError {
    error: string;
    message: string;
}
