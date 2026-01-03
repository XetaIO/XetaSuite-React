import { type FC, type ReactNode } from "react";

export interface ListPageCardProps {
    /** Card content */
    children: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Container card for list pages with consistent styling
 *
 * @example
 * <ListPageCard>
 *     <ListPageHeader ... />
 *     <SearchSection ... />
 *     <Table>...</Table>
 * </ListPageCard>
 */
export const ListPageCard: FC<ListPageCardProps> = ({ children, className = "" }) => {
    return (
        <div className={`card-base ${className}`}>
            {children}
        </div>
    );
};

export default ListPageCard;
