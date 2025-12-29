import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import type { PaginationMeta, ManagerResult, PaginatedResponse } from "@/shared/types";
import { UI_CONSTANTS } from "@/shared/constants";

/**
 * Configuration options for useListPage hook
 */
export interface UseListPageOptions<TFilters> {
    /** Function to fetch data from API */
    fetchFn: (filters: TFilters) => Promise<ManagerResult<PaginatedResponse<unknown>>>;
    /** Default sort field */
    defaultSortField?: string;
    /** Default sort direction */
    defaultSortDirection?: "asc" | "desc";
    /** Debounce delay in milliseconds (default: UI_CONSTANTS.DEBOUNCE_MS) */
    debounceMs?: number;
    /** Default items per page (default: UI_CONSTANTS.DEFAULT_PER_PAGE) */
    perPage?: number;
    /** Additional filters to include in API calls (for custom page-specific filters) */
    additionalFilters?: Partial<TFilters>;
}

/**
 * Return type for useListPage hook
 */
export interface UseListPageReturn<T, TFilters> {
    // Data
    items: T[];
    meta: PaginationMeta | null;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;

    // Pagination
    currentPage: number;
    setCurrentPage: (page: number) => void;
    handlePageChange: (page: number) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    debouncedSearch: string;

    // Sorting
    sortBy: string | undefined;
    sortDirection: "asc" | "desc";
    handleSort: (field: string) => void;
    renderSortIcon: (field: string) => ReactNode;

    // Actions
    refresh: () => void;
    buildFilters: () => TFilters;
}

/**
 * Generic hook for list pages with pagination, search, and sorting
 * Reduces boilerplate code in all ListPage components
 */
export function useListPage<T, TFilters>({
    fetchFn,
    defaultSortField,
    defaultSortDirection = "asc",
    debounceMs = UI_CONSTANTS.DEBOUNCE_MS,
    additionalFilters = {},
}: UseListPageOptions<TFilters>): UseListPageReturn<T, TFilters> {
    const { t } = useTranslation();

    // Data state
    const [items, setItems] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Sorting state
    const [sortBy, setSortBy] = useState<string | undefined>(defaultSortField);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);

    // Serialize additionalFilters for stable dependency
    const additionalFiltersKey = JSON.stringify(additionalFilters);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs]);

    // Build filters object for API call
    const buildFilters = useCallback((): TFilters => {
        const parsedAdditionalFilters = JSON.parse(additionalFiltersKey) as Partial<TFilters>;
        return {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
            ...parsedAdditionalFilters,
        } as TFilters;
    }, [currentPage, debouncedSearch, sortBy, sortDirection, additionalFiltersKey]);

    // Fetch data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const filters = buildFilters();
        const result = await fetchFn(filters);

        if (result.success && result.data) {
            setItems(result.data.data as T[]);
            setMeta(result.data.meta);
        } else {
            setError(result.error || t("errors.generic"));
        }

        setIsLoading(false);
    }, [fetchFn, buildFilters, t]);

    // Fetch on filter changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Handle sort
    const handleSort = useCallback((field: string) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    }, [sortBy]);

    // Render sort icon
    const renderSortIcon = useCallback((field: string): ReactNode => {
        if (sortBy !== field) {
            return (
                <span className="ml-1 text-gray-300 dark:text-gray-600">
                    <FaArrowUp className="h-3 w-3" />
                </span>
            );
        }
        return sortDirection === "asc" ? (
            <FaArrowUp className="ml-1 h-3 w-3 text-brand-500" />
        ) : (
            <FaArrowDown className="ml-1 h-3 w-3 text-brand-500" />
        );
    }, [sortBy, sortDirection]);

    // Refresh data
    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        // Data
        items,
        meta,
        isLoading,
        setIsLoading,
        error,

        // Pagination
        currentPage,
        setCurrentPage,
        handlePageChange,

        // Search
        searchQuery,
        setSearchQuery,
        debouncedSearch,

        // Sorting
        sortBy,
        sortDirection,
        handleSort,
        renderSortIcon,

        // Actions
        refresh,
        buildFilters,
    };
}
