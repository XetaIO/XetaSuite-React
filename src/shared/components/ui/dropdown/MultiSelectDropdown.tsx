import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaCheck, FaMagnifyingGlass, FaXmark } from "react-icons/fa6";

/**
 * Base interface for dropdown options
 */
export interface MultiSelectOption {
    id: number | string;
    name: string;
}

/**
 * Props for the MultiSelectDropdown component
 */
export interface MultiSelectDropdownProps<T extends MultiSelectOption> {
    /** Currently selected values (ids) */
    value: (number | string)[];
    /** Callback when selection changes */
    onChange: (values: (number | string)[]) => void;
    /** Available options to display */
    options: T[];
    /** Placeholder text when no selection */
    placeholder: string;
    /** Placeholder for search input */
    searchPlaceholder: string;
    /** Text shown when search has no results */
    noResultsText: string;
    /** Text shown while loading */
    loadingText: string;
    /** Whether the dropdown is disabled */
    disabled?: boolean;
    /** Whether options are currently loading */
    isLoading?: boolean;
    /** Callback when search value changes (for API-based search) */
    onSearch?: (search: string) => void;
    /** Debounce delay in ms for search (default: 300) */
    searchDebounceMs?: number;
    /** Custom render function for option content */
    renderOption?: (option: T) => ReactNode;
    /** Custom filter function for local search (if onSearch not provided) */
    filterFn?: (option: T, search: string) => boolean;
    /** Additional class name for the container */
    className?: string;
    /** Label for selected count */
    selectedCountLabel?: (count: number) => string;
}

/**
 * A reusable multi-select searchable dropdown component
 */
export function MultiSelectDropdown<T extends MultiSelectOption>({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    noResultsText,
    loadingText,
    disabled = false,
    isLoading = false,
    onSearch,
    searchDebounceMs = 300,
    renderOption,
    filterFn,
    className = "",
    selectedCountLabel,
}: MultiSelectDropdownProps<T>) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle search with debounce
    const handleSearch = useCallback(
        (searchValue: string) => {
            setSearch(searchValue);

            if (onSearch) {
                if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                    onSearch(searchValue);
                }, searchDebounceMs);
            }
        },
        [onSearch, searchDebounceMs]
    );

    // Filter options locally if no onSearch provided
    const filteredOptions = onSearch
        ? options
        : options.filter((opt) =>
            filterFn
                ? filterFn(opt, search)
                : opt.name.toLowerCase().includes(search.toLowerCase())
        );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleToggle = (id: number | string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const handleRemove = (id: number | string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== id));
    };

    const getSelectedOptionNames = (): string[] => {
        return value
            .map((id) => options.find((opt) => opt.id === id)?.name)
            .filter((name): name is string => !!name);
    };

    const renderSelectedValue = () => {
        if (value.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>;
        }

        const names = getSelectedOptionNames();
        if (names.length <= 2) {
            return (
                <div className="flex flex-wrap gap-1">
                    {names.map((name, idx) => (
                        <span
                            key={value[idx]}
                            className="inline-flex items-center gap-1 rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
                        >
                            {name}
                            <button
                                title={t("common.delete")}
                                type="button"
                                onClick={(e) => handleRemove(value[idx], e)}
                                className="hover:text-brand-900 dark:hover:text-brand-100"
                            >
                                <FaXmark className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            );
        }

        return (
            <span className="text-gray-800 dark:text-white/90">
                {selectedCountLabel ? selectedCountLabel(value.length) : `${value.length} selected`}
            </span>
        );
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex w-full min-h-10.5 items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-white/5 dark:bg-white/3 dark:text-white/90 dark:focus:border-brand-800 ${disabled ? "cursor-not-allowed opacity-60" : ""
                    }`}
            >
                <div className="flex-1 pr-2">
                    {renderSelectedValue()}
                </div>
                <FaChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/5 dark:bg-neutral-900">
                    {/* Search Input */}
                    <div className="border-b border-gray-200 p-2 dark:border-white/5">
                        <div className="relative">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/5 dark:text-white/90 dark:placeholder-gray-500"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-48 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 text-center text-sm text-gray-500">
                                {loadingText}
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-sm text-gray-500">
                                {noResultsText}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleToggle(option.id)}
                                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
                                >
                                    {renderOption ? (
                                        renderOption(option)
                                    ) : (
                                        <span className="text-gray-800 dark:text-white/90">
                                            {option.name}
                                        </span>
                                    )}
                                    {value.includes(option.id) && (
                                        <FaCheck className="h-4 w-4 shrink-0 text-brand-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
