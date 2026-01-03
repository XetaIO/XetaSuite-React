import { type FC, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaMagnifyingGlass } from "react-icons/fa6";

export interface SearchInputProps {
    /** Current search value */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Placeholder text (defaults to t("common.searchPlaceholder")) */
    placeholder?: string;
    /** Additional CSS classes for the container */
    className?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Auto focus on mount */
    autoFocus?: boolean;
}

/**
 * Reusable search input component with icon and clear button
 *
 * @example
 * <SearchInput
 *     value={searchQuery}
 *     onChange={setSearchQuery}
 *     placeholder={t("companies.searchPlaceholder")}
 * />
 */
export const SearchInput: FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder,
    className = "max-w-md",
    disabled = false,
    autoFocus = false,
}) => {
    const { t } = useTranslation();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleClear = () => {
        onChange("");
    };

    return (
        <div className={`relative ${className}`}>
            <FaMagnifyingGlass className="search-icon" />
            <input
                type="text"
                placeholder={placeholder ?? t("common.searchPlaceholder")}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                autoFocus={autoFocus}
                className="input-base input-with-left-icon"
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="search-clear-button"
                    title={t("common.clearSearch")}
                    disabled={disabled}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchInput;
