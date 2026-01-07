import { type FC, type ReactNode } from "react";
import { SearchInput } from "@/shared/components/form";

export interface SearchSectionProps {
    /** Current search value */
    searchQuery: string;
    /** Callback when search changes */
    onSearchChange: (value: string) => void;
    /** Placeholder for search input */
    placeholder?: string;
    /** Additional content on the right side (filters, selection info, etc.) */
    rightContent?: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Search section with optional right-side content for filters or selection info
 *
 * @example
 * <SearchSection
 *     searchQuery={searchQuery}
 *     onSearchChange={setSearchQuery}
 *     rightContent={
 *         <span>3 items selected</span>
 *     }
 * />
 */
export const SearchSection: FC<SearchSectionProps> = ({
    searchQuery,
    onSearchChange,
    placeholder,
    rightContent,
    className = "",
}) => {
    return (
        <div className={`card-body-border ${className}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <SearchInput
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder={placeholder}
                    className="max-w-md flex-1"
                />
                {rightContent}
            </div>
        </div>
    );
};

export default SearchSection;
