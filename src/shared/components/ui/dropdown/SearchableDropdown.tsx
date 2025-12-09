import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { FaChevronDown, FaCheck, FaMagnifyingGlass } from "react-icons/fa6";

/**
 * Base interface for dropdown options
 */
export interface DropdownOption {
    id: number;
    name: string;
}

/**
 * Pinned item configuration for highlighting a specific option at the top
 */
export interface PinnedItem<T extends DropdownOption> {
    item: T;
    label: string;
}

/**
 * Props for the SearchableDropdown component
 */
export interface SearchableDropdownProps<T extends DropdownOption> {
    /** Currently selected value (id) */
    value: number | null | undefined;
    /** Callback when selection changes */
    onChange: (value: number | null) => void;
    /** Available options to display */
    options: T[];
    /** Placeholder text when no selection */
    placeholder: string;
    /** Placeholder for search input */
    searchPlaceholder: string;
    /** Text for "no selection" option (if nullable) */
    noSelectionText?: string;
    /** Text shown when search has no results */
    noResultsText: string;
    /** Text shown while loading */
    loadingText: string;
    /** Whether to allow null/empty selection */
    nullable?: boolean;
    /** Whether the dropdown is disabled */
    disabled?: boolean;
    /** Whether options are currently loading */
    isLoading?: boolean;
    /** Callback when search value changes (for API-based search) */
    onSearch?: (search: string) => void;
    /** Debounce delay in ms for search (default: 300) */
    searchDebounceMs?: number;
    /** Pinned item to show at top of list (e.g., item's original supplier) */
    pinnedItem?: PinnedItem<T>;
    /** Custom render function for option content */
    renderOption?: (option: T) => ReactNode;
    /** Custom render function for selected value display */
    renderValue?: (option: T | undefined) => ReactNode;
    /** Custom filter function for local search (if onSearch not provided) */
    filterFn?: (option: T, search: string) => boolean;
    /** Additional class name for the container */
    className?: string;
}

/**
 * A reusable searchable dropdown component with API search support,
 * null selection, pinned items, and custom rendering.
 */
export function SearchableDropdown<T extends DropdownOption>({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    noSelectionText,
    noResultsText,
    loadingText,
    nullable = false,
    disabled = false,
    isLoading = false,
    onSearch,
    searchDebounceMs = 300,
    pinnedItem,
    renderOption,
    renderValue,
    filterFn,
    className = "",
}: SearchableDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Find selected option
    const selectedOption = options.find((opt) => opt.id === value);

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

    // Filter out pinned item from regular list when not searching
    const displayOptions = pinnedItem && !search
        ? filteredOptions.filter((opt) => opt.id !== pinnedItem.item.id)
        : filteredOptions;

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

    const handleSelect = (id: number | null) => {
        onChange(id);
        setIsOpen(false);
        setSearch("");
    };

    const renderSelectedValue = () => {
        if (renderValue && selectedOption) {
            return renderValue(selectedOption);
        }
        if (selectedOption) {
            return selectedOption.name;
        }
        // Check if value matches pinned item
        if (pinnedItem && value === pinnedItem.item.id) {
            return pinnedItem.item.name;
        }
        return placeholder;
    };

    const hasValue = value !== null && value !== undefined;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${disabled ? "cursor-not-allowed opacity-60" : ""
                    }`}
            >
                <span className={hasValue ? "" : "text-gray-500 dark:text-gray-400"}>
                    {renderSelectedValue()}
                </span>
                <FaChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {/* Search Input */}
                    <div className="border-b border-gray-200 p-2 dark:border-gray-700">
                        <div className="relative">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:text-white/90 dark:placeholder-gray-500"
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
                        ) : (
                            <>
                                {/* Nullable option */}
                                {nullable && noSelectionText && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(null)}
                                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                    >
                                        <span className="italic">{noSelectionText}</span>
                                        {!hasValue && (
                                            <FaCheck className="h-4 w-4 text-brand-500" />
                                        )}
                                    </button>
                                )}

                                {/* Pinned item (shown at top when not searching) */}
                                {pinnedItem && !search && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(pinnedItem.item.id)}
                                        className="flex w-full items-center justify-between border-l-2 border-brand-500 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800 dark:text-white/90">
                                                {pinnedItem.item.name}
                                            </span>
                                            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                                                {pinnedItem.label}
                                            </span>
                                        </div>
                                        {value === pinnedItem.item.id && (
                                            <FaCheck className="h-4 w-4 text-brand-500" />
                                        )}
                                    </button>
                                )}

                                {/* Options list */}
                                {displayOptions.length === 0 && search ? (
                                    <div className="p-3 text-center text-sm text-gray-500">
                                        {noResultsText}
                                    </div>
                                ) : (
                                    displayOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleSelect(option.id)}
                                            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            {renderOption ? (
                                                renderOption(option)
                                            ) : (
                                                <span className="text-gray-800 dark:text-white/90">
                                                    {option.name}
                                                </span>
                                            )}
                                            {value === option.id && (
                                                <FaCheck className="h-4 w-4 shrink-0 text-brand-500" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
