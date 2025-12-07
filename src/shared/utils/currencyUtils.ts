import i18n from "@/app/i18n";

/**
 * Currency formatting utilities with i18n support
 */

/**
 * Get the current locale from i18n
 */
const getLocale = (): string => {
    return i18n.language || "en";
};

/**
 * Format a number as currency using the current i18n locale
 * @param amount - The amount to format (can be null or undefined)
 * @param currency - The currency code (default: EUR)
 * @param fallback - The fallback string to return if amount is null/undefined (default: "—")
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number | null | undefined,
    currency: string = "EUR",
    fallback: string = "—"
): string => {
    if (amount === null || amount === undefined) return fallback;

    const locale = getLocale();
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(amount);
};

/**
 * Format a number as currency with compact notation for large values
 * @param amount - The amount to format
 * @param currency - The currency code (default: EUR)
 * @returns Formatted currency string with compact notation (e.g., 1.5K €)
 */
export const formatCurrencyCompact = (
    amount: number | null | undefined,
    currency: string = "EUR",
    fallback: string = "—"
): string => {
    if (amount === null || amount === undefined) return fallback;

    const locale = getLocale();
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        compactDisplay: "short",
    }).format(amount);
};
