import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../../services/api';

interface Language {
    code: 'fr' | 'en';
    name: string;
    flag: string;
}

const languages: Language[] = [
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'en', name: 'English', flag: 'gb' },
];

// SVG Flag components for better compatibility
const FlagFR = () => (
    <svg className="h-5 w-5 rounded-sm" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <g fillRule="evenodd" strokeWidth="1pt">
            <path fill="#fff" d="M0 0h640v480H0z" />
            <path fill="#002654" d="M0 0h213.3v480H0z" />
            <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
        </g>
    </svg>
);

const FlagGB = () => (
    <svg className="h-5 w-5 rounded-sm" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <path fill="#012169" d="M0 0h640v480H0z" />
        <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
        <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
        <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
        <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
    </svg>
);

const FlagComponent = ({ code }: { code: string }) => {
    if (code === 'fr') return <FlagFR />;
    if (code === 'gb') return <FlagGB />;
    return null;
};

interface LanguageSwitcherProps {
    /** Compact mode for mobile - shows only flag */
    compact?: boolean;
    /** Direction of the dropdown menu */
    dropdownDirection?: 'up' | 'down';
}

export function LanguageSwitcher({ compact = false, dropdownDirection = 'down' }: LanguageSwitcherProps) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

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

    const handleLanguageChange = async (lang: Language) => {
        if (lang.code === i18n.language || isChanging) return;

        setIsChanging(true);
        setIsOpen(false);

        try {
            // Change language in i18next (also updates cookie via detector)
            await i18n.changeLanguage(lang.code);

            // Persist to backend if user is authenticated
            try {
                await userApi.updateLocale(lang.code);
            } catch {
                // Silently fail - user might not be authenticated
                // Cookie will still work for next session
            }
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isChanging}
                className={`flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-wait disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${compact ? 'h-10 w-10' : 'h-11 gap-2 px-3'
                    }`}
                aria-label="Change language"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <FlagComponent code={currentLanguage.flag} />
                {!compact && (
                    <>
                        <span className="hidden text-sm font-medium sm:inline">
                            {currentLanguage.code.toUpperCase()}
                        </span>
                        <svg
                            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                    className={`absolute right-0 z-50 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900 ${dropdownDirection === 'up' ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'
                        }`}
                    role="listbox"
                    aria-label="Select language"
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang)}
                            disabled={isChanging}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${lang.code === i18n.language
                                ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                            role="option"
                            aria-selected={lang.code === i18n.language}
                        >
                            <FlagComponent code={lang.flag} />
                            <span className="font-medium">{lang.name}</span>
                            {lang.code === i18n.language && (
                                <svg
                                    className="ml-auto h-4 w-4"
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
            )}
        </div>
    );
}

export default LanguageSwitcher;
