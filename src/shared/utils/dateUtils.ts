import i18n from "@/app/i18n";

/**
 * Date formatting utilities with i18n support
 */

/**
 * Get the current locale from i18n
 */
const getLocale = (): string => {
    return i18n.language || "en";
};

/**
 * Format a date string for display using the current i18n locale
 * @param dateString - ISO date string to format
 * @param options - Intl.DateTimeFormatOptions to customize output
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string,
    options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }
): string => {
    const locale = getLocale();
    return new Date(dateString).toLocaleDateString(locale, options);
};

/**
 * Format a date string with time
 * @param dateString - ISO date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (
    dateString: string,
    options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }
): string => {
    const locale = getLocale();
    return new Date(dateString).toLocaleDateString(locale, options);
};

/**
 * Format a date as relative time (e.g., "2 days ago")
 * @param dateString - ISO date string to format
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
    const locale = getLocale();
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, "second");
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return rtf.format(-diffInMinutes, "minute");
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return rtf.format(-diffInHours, "hour");
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return rtf.format(-diffInDays, "day");
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return rtf.format(-diffInMonths, "month");
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return rtf.format(-diffInYears, "year");
};
