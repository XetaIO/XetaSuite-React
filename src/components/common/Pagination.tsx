import { useTranslation } from "react-i18next";
import type { PaginationMeta } from "../../types/pagination";

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
    const { t } = useTranslation();
    const { current_page, last_page, from, to, total } = meta;

    // Generate page numbers to display
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (last_page <= maxVisible) {
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            if (current_page <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(last_page);
            } else if (current_page >= last_page - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = last_page - 3; i <= last_page; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                pages.push(current_page - 1);
                pages.push(current_page);
                pages.push(current_page + 1);
                pages.push("...");
                pages.push(last_page);
            }
        }

        return pages;
    };

    if (last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row sm:px-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('pagination.showing', { from, to, total })}
            </div>
            <nav className="flex items-center gap-1">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) =>
                    typeof page === "number" ? (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${page === current_page
                                ? "bg-brand-600 text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span
                            key={index}
                            className="inline-flex h-9 w-9 items-center justify-center text-sm text-gray-500 dark:text-gray-400"
                        >
                            {page}
                        </span>
                    )
                )}

                {/* Next button */}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </nav>
        </div>
    );
}
