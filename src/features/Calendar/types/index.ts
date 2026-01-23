// Import EventCategory
import type { EventCategory } from '@/features/EventCategories/types';

/**
 * Simplified category option for dropdown selection
 */
export interface AvailableEventCategory {
    id: number;
    name: string;
    color: string;
}

// Calendar Event types
export interface CalendarEvent {
    id: number;
    event_category_id?: number;
    title: string;
    description: string | null;
    color: string | null;
    start_at: string;
    end_at: string | null;
    all_day: boolean;
    category?: EventCategory;
    created_by?: {
        id: number;
        full_name: string;
    };
    created_by_name: string;
    created_at: string;
    updated_at: string;
}

export interface CalendarEventFormData {
    title: string;
    description?: string;
    event_category_id?: number;
    color?: string | null;
    start_at: string;
    end_at?: string;
    all_day: boolean;
}

export interface CalendarEventDatesUpdate {
    start_at: string;
    end_at?: string;
    all_day: boolean;
}

// FullCalendar event format
export interface FullCalendarEvent {
    id: string;
    type: 'event' | 'maintenance' | 'incident';
    resourceId: number;
    title: string;
    start: string;
    end: string | null;
    allDay: boolean;
    color: string;
    editable?: boolean;
    extendedProps: {
        type: 'event' | 'maintenance' | 'incident';
        description?: string | null;
        category?: string | null;
        categoryId?: number | null;
        createdBy?: string;
        // For maintenances/incidents
        status?: string;
        statusLabel?: string;
        material?: string;
        maintenanceType?: string;
        severity?: string;
        severityLabel?: string;
        siteName?: string;
    };
}

// Filters for calendar
export interface CalendarFilters {
    start?: string;
    end?: string;
    show_maintenances?: boolean;
    show_incidents?: boolean;
}
