// API response types
export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface ValidationErrors {
    [key: string]: string[];
}

// Single item response wrapper
export interface SingleResponse<T> {
    data: T;
}
