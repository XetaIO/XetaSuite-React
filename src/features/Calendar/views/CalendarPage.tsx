/**
 * CalendarPage - Main calendar view component
 *
 * This page displays a full-featured calendar using FullCalendar library.
 * It supports:
 * - Multiple views: Month, Week, Day, List
 * - Event types: Calendar events, Maintenances, Incidents
 * - Drag & drop to reschedule events
 * - Click to edit or view event details
 * - Date range selection to create new events
 * - Filtering by event type
 *
 * Architecture:
 * - Data fetching is handled by useCalendarData hook
 * - Event interactions are handled by useCalendarEventHandlers hook
 * - Event rendering is handled by CalendarEventContent component
 */

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventContentArg } from '@fullcalendar/core';

// Shared components
import PageMeta from '@/shared/components/common/PageMeta';
import ComponentCard from '@/shared/components/common/ComponentCard';
import Button from '@/shared/components/ui/button/Button';

// Feature-specific imports
import { useCalendarData, useCalendarEventHandlers } from '../hooks';
import { CalendarEventContent } from '../components';
import { TodayEventsBanner } from './TodayEventsBanner';
import { CalendarEventModal } from './CalendarEventModal';
import { CalendarFiltersPanel } from './CalendarFiltersPanel';
import type { FullCalendarEvent, CalendarFilters, CalendarEvent } from '../types';
import { useEntityPermissions } from '@/shared/hooks';
import { useAuth } from '@/features/Auth/hooks';
import { FaPlus } from 'react-icons/fa6';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CalendarPage() {
    const { t, i18n } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Reference to FullCalendar instance (for programmatic control)
    const calendarRef = useRef<FullCalendar>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    /** Calendar events to display */
    const [events, setEvents] = useState<FullCalendarEvent[]>([]);

    /** Today's events for the banner */
    const [todayEvents, setTodayEvents] = useState<FullCalendarEvent[]>([]);

    /** Filter settings for showing/hiding event types */
    const [filters, setFilters] = useState<CalendarFilters>({
        show_maintenances: true,
        show_incidents: true,
    });

    /** Modal visibility state */
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    /** Currently selected event for editing (null = create mode) */
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    /** Date info from selection (used when creating new event) */
    const [selectedDateInfo, setSelectedDateInfo] = useState<{
        start: Date;
        end: Date;
        allDay: boolean;
    } | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // Hooks
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Data fetching hook
     * Handles calendar data and today's events fetching with proper deduplication
     */
    const {
        fetchCalendarData,
        fetchTodayEvents,
        handleDatesSet,
        currentDateRange,
    } = useCalendarData(filters, setEvents, setTodayEvents);

    /**
     * Event interaction handlers
     * Handles click, drag & drop, resize operations
     */
    const {
        handleEventClick,
        handleBannerEventClick,
        handleDateSelect,
        handleEventDrop,
        handleEventResize,
    } = useCalendarEventHandlers(
        setEvents,
        setSelectedEvent,
        setSelectedDateInfo,
        setIsEventModalOpen,
        fetchTodayEvents
    );

    // Permissions
    const permissions = useEntityPermissions("calendarEvent", { hasPermission, isOnHeadquarters });

    // ─────────────────────────────────────────────────────────────────────────
    // Event Handlers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Render event content using custom component
     * Memoized to prevent unnecessary re-renders
     */
    const renderEventContent = useCallback((eventInfo: EventContentArg) => (
        <CalendarEventContent eventInfo={eventInfo} />
    ), []);

    /**
     * Handle "Create Event" button click
     * Opens modal in create mode without pre-filled dates
     */
    const handleCreateClick = useCallback(() => {
        setSelectedEvent(null);
        setSelectedDateInfo(null);
        setIsEventModalOpen(true);
    }, []);

    /**
     * Handle modal close
     * Resets all modal-related state
     */
    const handleModalClose = useCallback(() => {
        setIsEventModalOpen(false);
        setSelectedEvent(null);
        setSelectedDateInfo(null);
    }, []);

    /**
     * Handle successful event save
     * Closes modal and refreshes calendar data
     */
    const handleEventSave = useCallback(() => {
        handleModalClose();

        // Refresh calendar data if we have a date range
        if (currentDateRange.current) {
            fetchCalendarData(
                currentDateRange.current.start,
                currentDateRange.current.end,
                filters
            );
        }

        // Also refresh today's events for the banner
        fetchTodayEvents();
    }, [handleModalClose, currentDateRange, fetchCalendarData, fetchTodayEvents, filters]);

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Page metadata for SEO/title */}
            <PageMeta
                title={t('calendar.pageTitle')}
                description={t('calendar.title')}
            />

            <div className="space-y-6">
                {/* ─────────────────────────────────────────────────────────────
                    Today's Events Banner
                    Shows a summary of events happening today
                ───────────────────────────────────────────────────────────── */}
                <TodayEventsBanner
                    events={todayEvents}
                    onEventClick={handleBannerEventClick}
                />

                {/* ─────────────────────────────────────────────────────────────
                    Main Calendar Card
                ───────────────────────────────────────────────────────────── */}
                <ComponentCard title={t('calendar.title')}>
                    {/* Header: Filters + Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        {/* Left side: Filters */}
                        <CalendarFiltersPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                        />

                        {/* Right side: Create button */}
                        <div className="flex items-center gap-2">
                            {permissions.canCreate && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    startIcon={<FaPlus className="h-4 w-4" />}
                                    onClick={handleCreateClick}
                                >
                                    {t('calendar.events.create')}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* FullCalendar Component */}
                    <div className="calendar-wrapper">
                        <FullCalendar
                            ref={calendarRef}
                            // Plugins for different views and interactions
                            plugins={[
                                dayGridPlugin,    // Month view
                                timeGridPlugin,   // Week/Day time grid views
                                listPlugin,       // List view
                                interactionPlugin // Drag & drop, selection
                            ]}
                            // Initial configuration
                            initialView="dayGridMonth"
                            locale={i18n.language}
                            nowIndicator={true}
                            // Toolbar configuration
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                            }}
                            // Localized button labels
                            buttonText={{
                                today: t('calendar.today'),
                                month: t('calendar.views.month'),
                                week: t('calendar.views.week'),
                                day: t('calendar.views.day'),
                                list: t('calendar.views.list'),
                            }}
                            // Transform events to FullCalendar format
                            events={events.map((event) => ({
                                id: event.id,
                                title: event.title,
                                start: event.start,
                                end: event.end || undefined,
                                allDay: event.allDay,
                                backgroundColor: event.color,
                                borderColor: 'transparent',
                                // Only calendar events are editable
                                editable: event.editable !== false && event.type === 'event',
                                extendedProps: {
                                    ...event.extendedProps,
                                    type: event.type,
                                },
                            }))}
                            // Custom event renderer
                            eventContent={renderEventContent}
                            // Interaction settings
                            selectable={permissions.canCreate && !isOnHeadquarters}           // Allow date selection
                            selectMirror         // Show placeholder during selection
                            editable             // Allow drag & drop
                            droppable            // Allow external drops
                            weekends             // Show weekend days
                            dayMaxEvents={3}     // Show "more" link after 3 events
                            height="auto"
                            // Event handlers
                            eventClick={handleEventClick}
                            select={handleDateSelect}
                            eventDrop={handleEventDrop}
                            eventResize={handleEventResize}
                            datesSet={handleDatesSet}
                            // Formatting
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                meridiem: false,
                            }}
                            eventDisplay="block"
                            // Custom styling (removes default borders/shadows)
                            eventClassNames="!bg-transparent !border-0 !shadow-none"
                        />
                    </div>
                </ComponentCard>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                Event Modal
                Used for creating and editing calendar events
            ───────────────────────────────────────────────────────────────── */}
            <CalendarEventModal
                isOpen={isEventModalOpen}
                onClose={handleModalClose}
                event={selectedEvent}
                initialDateInfo={selectedDateInfo}
                onSave={handleEventSave}
            />
        </>
    );
}

export default CalendarPage;
