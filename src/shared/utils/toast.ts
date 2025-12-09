import { toast, type ToastOptions, type Id } from 'react-toastify';

/**
 * Toast notification utility
 * Wrapper around react-toastify for consistent notifications
 */

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

/**
 * Show a success notification
 */
export const showSuccess = (message: string, options?: ToastOptions): Id => {
    return toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Show an error notification
 */
export const showError = (message: string, options?: ToastOptions): Id => {
    return toast.error(message, { ...defaultOptions, autoClose: 5000, ...options });
};

/**
 * Show a warning notification
 */
export const showWarning = (message: string, options?: ToastOptions): Id => {
    return toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Show an info notification
 */
export const showInfo = (message: string, options?: ToastOptions): Id => {
    return toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Show a loading notification that can be updated later
 */
export const showLoading = (message: string, options?: ToastOptions): Id => {
    return toast.loading(message, { ...defaultOptions, autoClose: false, ...options });
};

/**
 * Update an existing toast (useful for loading → success/error transitions)
 */
export const updateToast = (
    toastId: Id,
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options?: ToastOptions
): void => {
    toast.update(toastId, {
        render: message,
        type,
        isLoading: false,
        autoClose: type === 'error' ? 5000 : 4000,
        ...options,
    });
};

/**
 * Dismiss a specific toast or all toasts
 */
export const dismissToast = (toastId?: Id): void => {
    if (toastId) {
        toast.dismiss(toastId);
    } else {
        toast.dismiss();
    }
};

/**
 * Toast utility object for convenient imports
 */
export const toastUtils = {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    update: updateToast,
    dismiss: dismissToast,
};

export default toastUtils;
