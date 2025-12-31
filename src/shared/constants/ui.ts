/**
 * UI Constants - Configuration values for consistent UI behavior across the application
 *
 * Note: CSS classes are defined in src/app/styles/index.css using @layer components
 */

/**
 * Configuration constants for UI behavior
 */
export const UI_CONSTANTS = {
    /** Debounce delay for search inputs in milliseconds */
    DEBOUNCE_MS: 300,
    /** Default number of items per page for pagination */
    DEFAULT_PER_PAGE: 15,
    /** Number of items for mini/preview lists */
    MINI_LIST_PER_PAGE: 5,
    /** Maximum QR code size in pixels */
    MAX_QR_SIZE: 400,
    /** Minimum QR code size in pixels */
    MIN_QR_SIZE: 100,
    /** Default QR code size in pixels */
    DEFAULT_QR_SIZE: 200,
    /** Number of skeleton rows to show while loading */
    SKELETON_ROWS: 6,
} as const;
