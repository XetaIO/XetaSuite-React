import { type FC, type ReactNode } from "react";

export interface ErrorAlertProps {
    /** Error message to display */
    message: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Error alert component for displaying error messages in lists
 *
 * @example
 * {error && <ErrorAlert message={error} />}
 */
export const ErrorAlert: FC<ErrorAlertProps> = ({ message, className = "" }) => {
    return (
        <div className={`alert-error ${className}`}>
            {message}
        </div>
    );
};

export default ErrorAlert;
