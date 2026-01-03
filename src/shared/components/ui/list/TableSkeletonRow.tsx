import { type FC } from "react";
import { TableRow, TableCell } from "../table";

export interface SkeletonCellConfig {
    /** Width class (e.g., "w-32", "w-48") */
    width: string;
    /** Whether to center the skeleton */
    center?: boolean;
    /** Whether to align to the right */
    right?: boolean;
    /** Additional CSS classes for the cell */
    className?: string;
}

export interface TableSkeletonRowProps {
    /** Configuration for each cell */
    cells: SkeletonCellConfig[];
    /** Additional CSS classes for the row */
    className?: string;
}

/**
 * Single skeleton row for table loading state
 *
 * @example
 * <TableSkeletonRow
 *     cells={[
 *         { width: "w-32" },
 *         { width: "w-48" },
 *         { width: "w-8", center: true },
 *         { width: "w-16", right: true },
 *     ]}
 * />
 */
export const TableSkeletonRow: FC<TableSkeletonRowProps> = ({
    cells,
    className = "",
}) => {
    return (
        <TableRow className={`table-row-border ${className}`}>
            {cells.map((cell, index) => (
                <TableCell
                    key={index}
                    className={`table-body-cell ${cell.className ?? ""}`}
                >
                    <div
                        className={`skeleton-text ${cell.width} ${cell.center ? "mx-auto" : ""
                            } ${cell.right ? "ml-auto" : ""}`}
                    />
                </TableCell>
            ))}
        </TableRow>
    );
};

export interface TableSkeletonRowsProps {
    /** Number of skeleton rows to display */
    count?: number;
    /** Configuration for each cell */
    cells: SkeletonCellConfig[];
    /** Additional CSS classes for each row */
    rowClassName?: string;
}

/**
 * Multiple skeleton rows for table loading state
 *
 * @example
 * <TableSkeletonRows
 *     count={6}
 *     cells={[
 *         { width: "w-32" },
 *         { width: "w-48" },
 *         { width: "w-8", center: true },
 *         { width: "w-16", right: true },
 *     ]}
 * />
 */
export const TableSkeletonRows: FC<TableSkeletonRowsProps> = ({
    count = 6,
    cells,
    rowClassName = "",
}) => {
    return (
        <>
            {[...Array(count)].map((_, index) => (
                <TableSkeletonRow key={index} cells={cells} className={rowClassName} />
            ))}
        </>
    );
};

export default TableSkeletonRows;
