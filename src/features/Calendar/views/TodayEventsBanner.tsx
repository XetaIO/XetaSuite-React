import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { FullCalendarEvent } from '../types';

interface TodayEventsBannerProps {
    events: FullCalendarEvent[];
    onEventClick: (event: FullCalendarEvent) => void;
}

export function TodayEventsBanner({ events, onEventClick }: TodayEventsBannerProps) {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Handle drag start
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        // Don't start drag if clicking on a button or link
        if ((e.target as HTMLElement).closest('button, a')) return;

        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
        scrollRef.current.style.cursor = 'grabbing';
    }, []);

    // Handle drag move
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Multiplier for scroll speed
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    // Handle drag end
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grab';
        }
    }, []);

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (scrollRef.current) {
                scrollRef.current.style.cursor = 'grab';
            }
        }
    }, [isDragging]);

    // Scroll with buttons
    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 320; // Card width + gap
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }, []);

    // Format time range
    const formatTimeRange = (start: string, end?: string | null) => {
        const startDate = new Date(start);
        const startTime = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        if (end) {
            const endDate = new Date(end);
            const endTime = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            return `${startTime} - ${endTime}`;
        }
        return startTime;
    };

    // Get category/type badge
    const getTypeBadge = (event: FullCalendarEvent) => {
        const type = event.type || 'event';
        const category = event.extendedProps?.category;

        if (category) {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: `${event.color}99` }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                    {category}
                </span>
            );
        }

        /**
         * Get the display label for the event type
         * Uses category name if available, otherwise falls back to type translation
         */
        const getTypeLabel = (): string => {
            if (category) return category;
            return t(`calendar.types.${type}`);
        };

        return (
            <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium text-white dark:text-white/90"
                style={{ backgroundColor: `${event.color}99` }}
            >
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: event.color }}
                />
                {getTypeLabel()}
            </span>
        );
    };

    // If no events, don't render the banner
    if (events.length === 0) {
        return null;
    }

    return (
        <div className="relative mb-6 border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 rounded-xl overflow-hidden">
            {/* Left scroll button */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-linear-to-r from-neutral-200 to-transparent dark:from-neutral-950 hover:from-neutral-300 dark:hover:from-neutral-900 transition-colors"
                aria-label={t('common.previous')}
            >
                <svg className="w-5 h-5 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Scrollable container */}
            <div
                ref={scrollRef}
                className="flex gap-4 px-12 py-4 overflow-x-auto no-scrollbar cursor-grab select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="shrink-0 w-72 bg-gray-100 dark:bg-neutral-800/80 rounded-lg p-4 border-l-4 cursor-pointer hover:bg-gray-200/70 dark:hover:bg-neutral-800 transition-colors"
                        style={{ borderLeftColor: event.color }}
                        onClick={() => !isDragging && onEventClick(event)}
                    >
                        {/* Header with title and chevron */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-gray-800 dark:text-white/90 font-semibold text-sm truncate">
                                    {event.title}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                    {event.allDay
                                        ? t('calendar.allDay')
                                        : formatTimeRange(event.start, event.end)
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Footer with badge and action */}
                        <div className="flex items-center justify-between mt-3">
                            {getTypeBadge(event)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Right scroll button */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-linear-to-l from-neutral-200 to-transparent dark:from-neutral-950 hover:from-neutral-300  dark:hover:from-neutral-900 transition-colors"
                aria-label={t('common.next')}
            >
                <svg className="w-5 h-5 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Date indicator on the right side */}
            <div className="absolute right-12 top-4 text-right text-gray-400 text-xs hidden lg:block">
                {new Date().toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}
            </div>
        </div>
    );
}
