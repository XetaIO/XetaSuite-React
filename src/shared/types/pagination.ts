// Pagination types
export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

// Base filter interface for paginated requests
export interface BaseFilters {
    page?: number;
    search?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}
