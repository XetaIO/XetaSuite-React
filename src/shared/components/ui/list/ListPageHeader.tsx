import { type FC, type ReactNode } from "react";

export interface ListPageHeaderProps {
    /** Main title */
    title: string;
    /** Optional description text */
    description?: string;
    /** Action buttons (right side) */
    actions?: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Header section for list pages with title, description and action buttons
 *
 * @example
 * <ListPageHeader
 *     title={t("companies.listTitle")}
 *     description={t("companies.description")}
 *     actions={
 *         <Button onClick={handleCreate}>
 *             {t("companies.create")}
 *         </Button>
 *     }
 * />
 */
export const ListPageHeader: FC<ListPageHeaderProps> = ({
    title,
    description,
    actions,
    className = "",
}) => {
    return (
        <div className={`card-header ${className}`}>
            <div>
                <h3 className="card-header-title">{title}</h3>
                {description && (
                    <p className="card-header-subtitle">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default ListPageHeader;
