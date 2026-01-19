import type { ReactNode } from "react";
import ThemeTogglerTwo from "@/shared/components/common/ThemeTogglerTwo";
import { LanguageSwitcher } from "@/shared/components/header/LanguageSwitcher";

interface AuthPageLayoutProps {
    children: ReactNode;
}

/**
 * Auth page layout - provides consistent layout for auth pages
 */
export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-neutral-950">
            <div className="fixed z-50 hidden bottom-6 right-6 sm:flex items-center gap-2">
                <LanguageSwitcher dropdownDirection="up" />
                <ThemeTogglerTwo />
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <img
                        className="h-15 dark:hidden"
                        src="/images/logo.svg"
                        alt="XetaSuite"
                    />
                    <img
                        className="h-15 hidden dark:block"
                        src="/images/logo-dark.svg"
                        alt="XetaSuite"
                    />
                </div>
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Facility Management ERP
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-gray-200 dark:bg-white/3 dark:border-white/5">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} XetaSuite. All rights reserved.
            </p>
        </div>
    );
}
