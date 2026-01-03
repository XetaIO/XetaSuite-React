import { type FC, type ReactNode } from "react";

export type SortDirection = "asc" | "desc";
export type TextAlign = "left" | "center" | "right";

export interface SortableTableHeaderProps {
    /** Column field name for sorting */
    field: string;
    /** Label to display */
    label: string;
    /** Current sort field */
    currentSortField?: string;
    /** Current sort direction */
    currentSortDirection?: SortDirection;
    /** Callback when sort is requested */
    onSort: (field: string) => void;
    /** Render function for sort icon */
    renderSortIcon: (field: string) => ReactNode;
    /** Text alignment (default: left) */
    align?: TextAlign;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Get alignment class based on TextAlign value
 */
const getAlignmentClass = (align: TextAlign): string => {
    switch (align) {
        case "center":
            return "table-header-cell-center";
        case "right":
            return "table-header-cell-right";
        case "left":
        default:
            return "table-header-cell-left";
    }
};

/**
 * Sortable table header cell component
 *
 * @example
 * <SortableTableHeader
 *     field="name"
 *     label={t("companies.name")}
 *     currentSortField={sortBy}
 *     currentSortDirection={sortDirection}
 *     onSort={handleSort}
 *     renderSortIcon={renderSortIcon}
 * />
 */
export const SortableTableHeader: FC<SortableTableHeaderProps> = ({
    field,
    label,
    onSort,
    renderSortIcon,
    align = "left",
    className,
}) => {
    const handleClick = () => {
        onSort(field);
    };

    const alignmentClass = getAlignmentClass(align);
    const combinedClassName = className ? `${alignmentClass} ${className}` : alignmentClass;

    return (
        <th className={combinedClassName}>
            <button
                type="button"
                onClick={handleClick}
                className="table-sortable-button"
            >
                {label}
                {renderSortIcon(field)}
            </button>
        </th>
    );
};

export interface StaticTableHeaderProps {
    /** Label to display */
    label: string;
    /** Text alignment (default: left) */
    align?: TextAlign;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Non-sortable (static) table header cell component
 *
 * @example
 * <StaticTableHeader label={t("common.actions")} align="right" />
 */
export const StaticTableHeader: FC<StaticTableHeaderProps> = ({
    label,
    align = "left",
    className,
}) => {
    const alignmentClass = getAlignmentClass(align);
    const combinedClassName = className ? `${alignmentClass} ${className}` : alignmentClass;

    return (
        <th className={combinedClassName}>
            {label}
        </th>
    );
};

export default SortableTableHeader;
