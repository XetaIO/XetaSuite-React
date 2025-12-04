// Material types for multi-tenancy
export interface Material {
    id: number;
    name: string;
    description?: string | null;
    zone_id: number;
    site_id: number;
    zone?: MaterialZone;
    creator?: MaterialCreator;
    created_by_id: number | null;
    created_by_name: string | null;
    // Counts
    qrcode_flash_count: number;
    incident_count: number;
    item_count: number;
    maintenance_count: number;
    cleaning_count: number;
    // Cleaning alert
    cleaning_alert: boolean;
    cleaning_alert_email: boolean;
    cleaning_alert_frequency_repeatedly: number;
    cleaning_alert_frequency_type: CleaningFrequency;
    last_cleaning_at?: string | null;
    last_cleaning_alert_send_at?: string | null;
    // Timestamps
    created_at: string;
    updated_at?: string;
}

export interface MaterialDetail extends Material {
    recipients?: MaterialRecipient[];
}

export interface MaterialZone {
    id: number;
    name: string;
}

export interface MaterialCreator {
    id: number;
    full_name: string;
}

export interface MaterialRecipient {
    id: number;
    full_name: string;
    email: string;
}

export type CleaningFrequency = 'daily' | 'weekly' | 'monthly';

export interface MaterialFormData {
    zone_id: number;
    name: string;
    description?: string | null;
    cleaning_alert?: boolean;
    cleaning_alert_email?: boolean;
    cleaning_alert_frequency_repeatedly?: number;
    cleaning_alert_frequency_type?: CleaningFrequency;
    recipients?: number[];
}

export interface MaterialFilters {
    page?: number;
    search?: string;
    zone_id?: number;
    sort_by?: 'name' | 'created_at' | 'last_cleaning_at';
    sort_direction?: 'asc' | 'desc';
}

export interface AvailableZone {
    id: number;
    name: string;
}

export interface AvailableRecipient {
    id: number;
    full_name: string;
    email: string;
}
