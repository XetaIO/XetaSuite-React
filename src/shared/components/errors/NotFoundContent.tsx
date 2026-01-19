import { Link } from "react-router";
import { useTranslation } from "react-i18next";

interface NotFoundContentProps {
    /** Title to display */
    title?: string;
    /** Message to display */
    message?: string;
    /** Link to go back to */
    backTo?: string;
    /** Label for the back link */
    backLabel?: string;
}

/**
 * Reusable 404 content component for use within pages/layouts
 * Does not include full-screen styling - meant to be embedded in existing layouts
 */
export default function NotFoundContent({
    title,
    message,
    backTo = "/",
    backLabel,
}: NotFoundContentProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
                <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
                    {title || t("errors.notFound")}
                </h1>

                <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
                <img
                    src="/images/error/404-dark.svg"
                    alt="404"
                    className="hidden dark:block"
                />

                <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
                    {message || t("errors.pageNotFound")}
                </p>

                <Link
                    to={backTo}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-white/5 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
                >
                    {backLabel || t("errors.backToHome")}
                </Link>
            </div>
        </div>
    );
}
