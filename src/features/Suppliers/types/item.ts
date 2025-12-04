// Item types for stock management
import { BadgeColor } from "@/shared/components/ui/badge/Badge";

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

    // Relations
    site?: {
        id: number;
        name: string;
    };
    supplier?: {
        id: number;
        name: string;
    };

    created_at: string;
    updated_at: string;
}

export type StockStatus = 'ok' | 'warning' | 'critical' | 'empty';

export interface ItemFilters {
    page?: number;
    search?: string;
    sort_by?: 'name' | 'description' | 'reference' | 'current_stock' | 'purchase_price' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}
