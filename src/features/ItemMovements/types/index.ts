/**
 * Movement types
 */
export type MovementType = 'entry' | 'exit';

/**
 * Basic item info for movement list
 */
export interface ItemMovementItem {
    id: number;
    name: string;
    reference: string | null;
    current_stock?: number;
    current_price?: number;
    site?: {
        id: number;
        name: string;
    };
}

/**
 * Item movement (entry/exit)
 */
export interface ItemMovement {
    id: number;
    item_id: number;
    type: MovementType;
    quantity: number;
    unit_price: number;
    total_price: number;

    supplier_id: number | null;
    supplier_name: string | null;
    supplier_invoice_number: string | null;
    supplier?: {
        id: number;
        name: string;
    };
    invoice_date: string | null;

    movable_type: string | null;
    movable_id: number | null;

    item?: ItemMovementItem;

    created_by_id: number | null;
    created_by_name: string | null;
    creator?: {
        id: number;
        full_name: string;
    };
    notes: string | null;
    movement_date: string;
    created_at: string;
}

/**
 * Form data for creating/updating a movement
 */
export interface ItemMovementFormData {
    type: MovementType;
    quantity: number;
    unit_price?: number;
    supplier_id?: number;
    supplier_invoice_number?: string;
    invoice_date?: string;
    notes?: string;
    movement_date?: string;
}

/**
 * Filters for movements list
 */
export interface ItemMovementFilters {
    type?: MovementType;
    per_page?: number;
    search?: string;
    item_id?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    page?: number;
}
