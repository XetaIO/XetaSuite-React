// Event Category types

export interface EventCategory {
    id: number;
    name: string;
    color: string;
    description: string | null;
    calendar_event_count: number;
    created_at: string;
    updated_at: string;
}

export interface EventCategoryFormData {
    name: string;
    color: string;
    description?: string;
}

export interface EventCategoryFilters {
    search?: string;
    sort_by?: 'name' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}
