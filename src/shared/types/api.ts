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

// Manager result type for service layer
// Supports void operations (delete) where data is not needed
export type ManagerResult<T> =
    | (T extends void ? { success: true; data?: undefined } : { success: true; data: T })
    | { success: false; error: string; data?: undefined };
