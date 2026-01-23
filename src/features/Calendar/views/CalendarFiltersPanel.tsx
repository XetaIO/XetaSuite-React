import { useTranslation } from 'react-i18next';
import type { CalendarFilters } from '../types';

interface CalendarFiltersPanelProps {
    filters: CalendarFilters;
    onFiltersChange: (filters: CalendarFilters) => void;
}

export function CalendarFiltersPanel({ filters, onFiltersChange }: CalendarFiltersPanelProps) {
    const { t } = useTranslation();

    const handleToggle = (key: keyof CalendarFilters) => {
        onFiltersChange({
            ...filters,
            [key]: !filters[key],
        });
    };

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('calendar.filters.show')}:
            </span>

            {/* Maintenances toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={filters.show_maintenances}
                        onChange={() => handleToggle('show_maintenances')}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-success-500" />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-success-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('calendar.filters.maintenances')}
                    </span>
                </div>
            </label>

            {/* Incidents toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={filters.show_incidents}
                        onChange={() => handleToggle('show_incidents')}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-error-500" />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-error-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('calendar.filters.incidents')}
                    </span>
                </div>
            </label>
        </div>
    );
}
