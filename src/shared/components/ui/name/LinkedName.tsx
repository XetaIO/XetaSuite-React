import { Link } from "react-router";

type LinkedNameProps = {
    canView: boolean;
    id?: number | null;
    name?: string | null;
    basePath: string; // ex: "materials", "incidents", "companies"
    className?: string;
};

export const LinkedName = ({ canView, id, name, basePath, className }: LinkedNameProps) => {
    if (!canView || !id) return <span className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{name || '—'}</span>;
    return (
        <Link to={`/${basePath}/${id}`} className={`font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400 ${className}`}>
            {name}
        </Link>
    );
};