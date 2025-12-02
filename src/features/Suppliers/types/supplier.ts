// Supplier types
export interface Supplier {
    id: number;
    name: string;
    description: string | null;
    created_by_id: number;
    created_by_name?: string;
    creator?: {
        id: number;
        full_name: string;
    };
    item_count: number;
    created_at: string;
    updated_at: string;
}

export interface SupplierFormData {
    name: string;
    description: string;
}

export interface SupplierFilters {
    page?: number;
    search?: string;
    sort_by?: 'name' | 'item_count' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}
