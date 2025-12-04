import type { BadgeColor } from "@/shared/components/ui/badge/Badge";

// Stock status types
export type StockStatus = 'ok' | 'warning' | 'critical' | 'empty';

// Movement types
export type MovementType = 'entry' | 'exit';

/**
 * Base Item interface for list views
 */
export interface Item {
    id: number;
    name: string;
    reference: string | null;
    description: string | null;

    // Stock
    current_stock: number;
    stock_status: StockStatus;
    stock_status_color: BadgeColor;

    // Pricing
    purchase_price: number | null;
    currency: string;

    // Alert thresholds
    number_warning_enabled: boolean;
    number_warning_minimum: number;
    number_critical_enabled: boolean;
    number_critical_minimum: number;

    // Counts
    item_entry_total: number;
    item_exit_total: number;
    item_entry_count: number;
    item_exit_count: number;
    material_count: number;
    qrcode_flash_count: number;

    // Relations
    site_id: number;
    site?: {
        id: number;
        name: string;
    };
    supplier_id: number | null;
    supplier?: {
        id: number;
        name: string;
    };

    created_at: string;
    updated_at: string;
}

/**
 * Detailed Item interface with all relations
 */
export interface ItemDetail extends Item {
    supplier_reference: string | null;
    supplier_name: string | null;

    // Creator info
    created_by_id: number | null;
    created_by_name: string | null;
    creator?: {
        id: number;
        full_name: string;
    };

    // Editor info
    edited_by_id: number | null;
    edited_by_name: string | null;
    editor?: {
        id: number;
        full_name: string;
    };

    // Relations
    materials?: ItemMaterial[];
    recipients?: ItemRecipient[];
}

/**
 * Material associated with an item
 */
export interface ItemMaterial {
    id: number;
    name: string;
    zone?: {
        id: number;
        name: string;
    };
}

/**
 * User recipient for an item
 */
export interface ItemRecipient {
    id: number;
    full_name: string;
    email: string;
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
    invoice_date: string | null;
    movable_type: string | null;
    movable_id: number | null;
    movable?: {
        id: number;
        name?: string;
        full_name?: string;
    };
    created_by_id: number;
    created_by_name: string;
    notes: string | null;
    movement_date: string;
    created_at: string;
}

/**
 * Item price history entry
 */
export interface ItemPrice {
    id: number;
    item_id: number;
    price: number;
    currency: string;
    changed_by_id: number;
    changed_by_name: string;
    notes: string | null;
    created_at: string;
}

/**
 * Monthly statistics for an item
 */
export interface ItemMonthlyStats {
    month: string; // e.g., "2024-01"
    entries: number;
    exits: number;
    entry_value: number;
    exit_value: number;
}

/**
 * Dashboard statistics for items
 */
export interface ItemDashboardStats {
    total_items: number;
    total_stock_value: number;
    items_in_critical: number;
    items_in_warning: number;
    recent_movements: ItemMovement[];
}

/**
 * Form data for creating/updating an item
 */
export interface ItemFormData {
    name: string;
    reference: string;
    description: string;
    purchase_price: number | null;
    currency: string;
    supplier_id: number | null;
    supplier_reference: string;
    number_warning_enabled: boolean;
    number_warning_minimum: number;
    number_critical_enabled: boolean;
    number_critical_minimum: number;
    material_ids: number[];
    recipient_ids: number[];
}

/**
 * Form data for creating a movement
 */
export interface ItemMovementFormData {
    type: MovementType;
    quantity: number;
    unit_price?: number;
    supplier_id?: number;
    supplier_invoice_number?: string;
    invoice_date?: string;
    movable_type?: string;
    movable_id?: number;
    notes?: string;
    movement_date?: string;
}

/**
 * Filters for item list
 */
export interface ItemFilters {
    page?: number;
    per_page?: number;
    search?: string;
    supplier_id?: number;
    stock_status?: StockStatus;
    sort_by?: 'name' | 'reference' | 'current_stock' | 'purchase_price' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}

/**
 * Filters for movement list
 */
export interface ItemMovementFilters {
    page?: number;
    per_page?: number;
    type?: MovementType;
    sort_by?: 'movement_date' | 'quantity' | 'total_price' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}

/**
 * Available supplier for dropdown
 */
export interface AvailableSupplier {
    id: number;
    name: string;
}

/**
 * Available material for dropdown
 */
export interface AvailableMaterial {
    id: number;
    name: string;
    zone?: {
        id: number;
        name: string;
    };
}

/**
 * Available recipient for dropdown
 */
export interface AvailableRecipient {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
}
