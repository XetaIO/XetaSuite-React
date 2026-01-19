import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { FaMagnifyingGlass, FaSpinner, FaScrewdriverWrench, FaSignsPost, FaCubes, FaTriangleExclamation, FaWrench, FaBuildingUser, FaBuildingFlag } from 'react-icons/fa6';
import { GlobalSearchManager } from '../services';
import type { GlobalSearchResults, SearchResult, SearchableType } from '../types';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const TYPE_ICONS: Record<SearchableType, React.ReactNode> = {
    materials: <FaWrench className="w-4 h-4" />,
    zones: <FaSignsPost className="w-4 h-4" />,
    items: <FaCubes className="w-4 h-4" />,
    incidents: <FaTriangleExclamation className="w-4 h-4" />,
    maintenances: <FaScrewdriverWrench className="w-4 h-4" />,
    companies: <FaBuildingUser className="w-4 h-4" />,
    sites: <FaBuildingFlag className="w-4 h-4" />,
};

const TYPE_COLORS: Record<SearchableType, string> = {
    materials: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    zones: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    items: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    incidents: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    maintenances: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    companies: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    sites: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GlobalSearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [flatResults, setFlatResults] = useState<SearchResult[]>([]);

    // Debounce search
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults(null);
            setFlatResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            const result = await GlobalSearchManager.search({ q: query, per_type: 5 });
            setIsLoading(false);

            if (result.success) {
                setResults(result.data);
                // Flatten results for keyboard navigation
                const flat: SearchResult[] = [];
                Object.values(result.data.results).forEach(typeResults => {
                    if (typeResults?.items) {
                        flat.push(...typeResults.items);
                    }
                });
                setFlatResults(flat);
                setSelectedIndex(0);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults(null);
            setFlatResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle escape key and body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleNavigate = useCallback((result: SearchResult) => {
        navigate(result.url);
        onClose();
    }, [navigate, onClose]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
            e.preventDefault();
            handleNavigate(flatResults[selectedIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }, [flatResults, selectedIndex, handleNavigate, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && flatResults[selectedIndex]) {
            const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            selectedElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex, flatResults]);

    const getTypeLabel = (type: SearchableType): string => {
        return t(`search.types.${type}`, type);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center px-4 border-b border-gray-200 dark:border-white/5">
                    <FaMagnifyingGlass className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('search.placeholder')}
                        className="w-full px-4 py-4 text-base bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    {isLoading && (
                        <FaSpinner className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    <div className="flex items-center gap-1 ml-2">
                        <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded dark:bg-white/10 dark:border-white/5 dark:text-gray-400">
                            esc
                        </kbd>
                    </div>
                </div>

                {/* Results */}
                <div
                    ref={resultsRef}
                    className="max-h-[60vh] overflow-y-auto"
                >
                    {query.length > 0 && query.length < 2 && (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            {t('search.minChars')}
                        </div>
                    )}

                    {query.length >= 2 && !isLoading && results && results.total === 0 && (
                        <div className="p-6 text-center">
                            <FaMagnifyingGlass className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {t('search.noResults', { query })}
                            </p>
                        </div>
                    )}

                    {results && results.total > 0 && (
                        <div className="py-2">
                            {(Object.entries(results.results) as [SearchableType, { count: number; items: SearchResult[] }][]).map(
                                ([type, typeResults]) => {
                                    if (!typeResults || typeResults.count === 0) return null;

                                    return (
                                        <div key={type} className="mb-2">
                                            {/* Type Header */}
                                            <div className="px-4 py-2 flex items-center gap-2">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${TYPE_COLORS[type]}`}>
                                                    {TYPE_ICONS[type]}
                                                </span>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    {getTypeLabel(type)}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    ({typeResults.count})
                                                </span>
                                            </div>

                                            {/* Results List */}
                                            <ul>
                                                {typeResults.items.map((item) => {
                                                    const globalIndex = flatResults.findIndex(
                                                        (r) => r.id === item.id && r.type === item.type
                                                    );
                                                    const isSelected = globalIndex === selectedIndex;

                                                    return (
                                                        <li key={`${item.type}-${item.id}`}>
                                                            <button
                                                                data-index={globalIndex}
                                                                onClick={() => handleNavigate(item)}
                                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                                className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${isSelected
                                                                    ? 'bg-brand-50 dark:bg-neutral-800'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                                                                    }`}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`font-medium truncate ${isSelected
                                                                            ? 'text-brand-700 dark:text-brand-300'
                                                                            : 'text-neutral-900 dark:text-white'
                                                                            }`}>
                                                                            {item.title}
                                                                        </span>
                                                                    </div>
                                                                    {(item.subtitle || item.description) && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                                            {item.subtitle || item.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {/* Show site name on HQ */}
                                                                {results.is_on_headquarters && item.meta?.site && (
                                                                    <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                                                        {item.meta.site}
                                                                    </span>
                                                                )}
                                                                {isSelected && (
                                                                    <kbd className="shrink-0 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded dark:bg-neutral-800 dark:border-white/5 dark:text-gray-400">
                                                                        ↵
                                                                    </kbd>
                                                                )}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}

                    {/* Empty State - Show before searching */}
                    {!query && (
                        <div className="p-6 text-center">
                            <FaMagnifyingGlass className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {t('search.startTyping')}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                {t('search.searchHint')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-neutral-800/50">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded border border-gray-200 dark:border-white/5">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded border border-gray-200 dark:border-white/5">↓</kbd>
                                {t('search.navigate')}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded border border-gray-200 dark:border-white/5">↵</kbd>
                                {t('search.select')}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded border border-gray-200 dark:border-white/5">esc</kbd>
                                {t('search.close')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
