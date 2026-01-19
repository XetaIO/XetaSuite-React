import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBuildingFlag } from 'react-icons/fa6';
import { useAuth } from '@/features/Auth/hooks/useAuth';
import type { UserSite } from '@/shared/types';
import { Badge } from '../ui';

interface SiteSwitcherProps {
    /** Compact mode for mobile - shows only icon */
    compact?: boolean;
    /** Direction of the dropdown menu */
    dropdownDirection?: 'up' | 'down';
    /** Full width mode for sidebar */
    fullWidth?: boolean;
}

export function SiteSwitcher({ compact = false, dropdownDirection = 'down', fullWidth = false }: SiteSwitcherProps) {
    const { t } = useTranslation();
    const { user, switchSite } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sites: UserSite[] = user?.sites || [];
    const currentSite = sites.find((site) => site.id === user?.current_site_id) || sites[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSiteChange = async (site: UserSite) => {
        if (site.id === user?.current_site_id || isChanging) return;

        setIsChanging(true);
        setIsOpen(false);

        try {
            await switchSite(site.id);
            // Reload the page to refresh permissions and UI based on new site context
            window.location.reload();
        } catch {
            setIsChanging(false);
        }
    };

    // Don't render if user has no sites or only one site
    if (!user || sites.length <= 1) {
        return null;
    }

    return (
        <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isChanging}
                className={`flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-wait disabled:opacity-50 dark:bg-white/3 dark:border-white/5 dark:text-white/90 dark:hover:bg-neutral-900 dark:hover:text-gray-200 ${fullWidth
                    ? 'h-11 w-full gap-3 px-4'
                    : compact
                        ? 'h-10 w-10'
                        : 'h-11 gap-2 px-3'
                    }`}
                aria-label={t('header.switchSite')}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <FaBuildingFlag className="h-4 w-4 shrink-0" />
                {!compact && (
                    <>
                        <span className={`text-sm font-medium truncate ${fullWidth ? 'flex-1 text-left' : 'hidden sm:inline max-w-30'}`}>
                            {currentSite?.name || t('header.selectSite')}
                        </span>
                        <svg
                            className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute z-50 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:bg-neutral-900 dark:border-white/5 dark:text-white/90 ${fullWidth ? 'left-0 right-0 w-full' : 'right-0 w-56'
                        } ${dropdownDirection === 'up'
                            ? 'bottom-full mb-2 origin-bottom-right'
                            : 'top-full mt-2 origin-top-right'
                        }`}
                    role="listbox"
                    aria-label={t('header.selectSite')}
                >
                    <div className="max-h-64 overflow-y-auto">
                        {sites.map((site) => (
                            <button
                                key={site.id}
                                onClick={() => handleSiteChange(site)}
                                disabled={isChanging}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${site.id === user?.current_site_id
                                    ? 'bg-brand-50 text-brand-600 dark:bg-neutral-800 dark:text-brand-400'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800'
                                    }`}
                                role="option"
                                aria-selected={site.id === user?.current_site_id}
                            >
                                <FaBuildingFlag className="h-4 w-4 shrink-0" />
                                <span className="font-medium truncate">
                                    {site.name}
                                    {site.is_headquarters && (
                                        <Badge size="sm" color="brand">
                                            {t('common.hq')}
                                        </Badge>
                                    )}
                                </span>
                                {site.id === user?.current_site_id && (
                                    <svg
                                        className="ml-auto h-4 w-4 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SiteSwitcher;
