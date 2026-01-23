import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventContentArg } from '@fullcalendar/core';
import { FaBuildingFlag } from 'react-icons/fa6';
import { useAuth } from '@/features/Auth';

/**
 * Props for CalendarEventContent component
 */
interface CalendarEventContentProps {
    eventInfo: EventContentArg;
}

/**
 * CalendarEventContent - Custom renderer for calendar events
 *
 * Renders events differently based on the current view:
 * - List view: Simple inline layout with colored dot
 * - Time grid (week/day): Compact colored block with time
 * - Month view: Card-style design with category badge
 *
 * @param eventInfo - FullCalendar event content arg containing event data and view info
 */
export const CalendarEventContent: FC<CalendarEventContentProps> = ({ eventInfo }) => {
    const { t } = useTranslation();
    const { event, timeText, view } = eventInfo;
    const { isOnHeadquarters } = useAuth();

    // Extract event properties
    const type = event.extendedProps.type || 'event';
    const category = event.extendedProps.category;
    const color = event.backgroundColor || '#465fff';

    /**
     * Get the display label for the event type
     * Uses category name if available, otherwise falls back to type translation
     */
    const getTypeLabel = (): string => {
        if (category) return category;
        return t(`calendar.types.${type}`);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // List View - Simple inline layout
    // ─────────────────────────────────────────────────────────────────────────
    if (view.type === 'listWeek') {
        return (
            <div className="flex items-center gap-2">
                <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                />
                <span className="font-medium">{event.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {getTypeLabel()}
                </span>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Month View - Card-style design with badge
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            className="w-full h-full rounded  p-2 cursor-pointer transition-colors overflow-hidden bg-gray-100 dark:bg-neutral-800/80 hover:bg-gray-200/70 dark:hover:bg-neutral-800"
            style={{ borderLeft: `3px solid ${color}` }}
        >
            {/* Event title and time */}
            <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                    <h4 className="text-gray-900 dark:text-white text-sm truncate leading-tight">
                        {event.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-400 text-xs mt-0.5">
                        {event.allDay ? t('calendar.allDay') : timeText || ''}
                    </p>
                </div>
            </div>

            {/* Category/Type badge */}
            <div className="mt-1.5 flex justify-between">
                <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white dark:text-white/90"
                    style={{ backgroundColor: `${color}99` }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    {getTypeLabel()}
                </span>
                {event.extendedProps?.siteName && isOnHeadquarters && (
                    <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white dark:text-white/90 dark:bg-white/5 bg-gray-300"
                    >
                        <FaBuildingFlag className="w-3 h-3" />
                        {event.extendedProps.siteName}
                    </span>
                )}
            </div>
        </div>
    );
};

export default CalendarEventContent;
