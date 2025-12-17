// Cleaning types for multi-tenancy

export type CleaningType = 'daily' | 'weekly' | 'bimonthly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'casual';

export interface Cleaning {
    id: number;
    description: string;
    type: CleaningType;
    type_label: string;
    // Site info
    site_id: number;
    site?: CleaningSite;
    // Material info
    material_id: number;
    material_name: string;
    material?: CleaningMaterial;
    // Creator info
    created_by_id: number | null;
    created_by_name: string | null;
    creator?: CleaningCreator;
    // Timestamps
    created_at: string;
    updated_at?: string;
}

export interface CleaningDetail extends Cleaning {
    edited_by_id: number | null;
    editor?: CleaningEditor;
}

export interface CleaningMaterial {
    id: number;
    name: string;
    zone?: {
        id: number;
        name: string;
    };
}

export interface CleaningCreator {
    id: number;
    full_name: string;
}

export interface CleaningEditor {
    id: number;
    full_name: string;
}

export interface CleaningSite {
    id: number;
    name: string;
}

export interface CleaningFormData {
    material_id: number;
    description: string;
    type: CleaningType;
}

export interface CleaningFilters {
    page?: number;
    search?: string;
    material_id?: number;
    type?: CleaningType;
    sort_by?: 'created_at' | 'type' | 'material_name';
    sort_direction?: 'asc' | 'desc';
}

export interface AvailableMaterial {
    id: number;
    name: string;
}

export interface TypeOption {
    value: CleaningType;
    label: string;
}
