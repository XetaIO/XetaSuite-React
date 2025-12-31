import { type FC, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TableRow, TableCell } from "../table";

export interface EmptyTableRowProps {
    /** Number of columns to span */
    colSpan: number;
    /** Current search query (to show "no results for X" message) */
    searchQuery?: string;
    /** Callback to clear search */
    onClearSearch?: () => void;
    /** Custom empty message (when no search) */
    emptyMessage?: ReactNode;
    /** Custom "no results for search" message */
    noResultsMessage?: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Empty state row for tables with optional search clear functionality
 *
 * @example
 * <EmptyTableRow
 *     colSpan={6}
 *     searchQuery={debouncedSearch}
 *     onClearSearch={() => setSearchQuery("")}
 *     emptyMessage={t("suppliers.noSuppliers")}
 * />
 */
export const EmptyTableRow: FC<EmptyTableRowProps> = ({
    colSpan,
    searchQuery,
    onClearSearch,
    emptyMessage,
    noResultsMessage,
    className = "",
}) => {
    const { t } = useTranslation();

    return (
        <TableRow className={className}>
            <TableCell
                className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                colSpan={colSpan}
            >
                {searchQuery ? (
                    <div className="empty-state-container">
                        {noResultsMessage ?? (
                            <p>{t("common.noResultsFor", { search: searchQuery })}</p>
                        )}
                        {onClearSearch && (
                            <button
                                onClick={onClearSearch}
                                className="empty-state-clear-button"
                            >
                                {t("common.clearSearch")}
                            </button>
                        )}
                    </div>
                ) : (
                    emptyMessage ?? t("common.noData")
                )}
            </TableCell>
        </TableRow>
    );
};

export default EmptyTableRow;
