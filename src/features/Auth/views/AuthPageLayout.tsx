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
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="fixed z-50 hidden bottom-6 right-6 sm:flex items-center gap-2">
                <LanguageSwitcher dropdownDirection="up" />
                <ThemeTogglerTwo />
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg">
                            <span className="text-2xl font-bold text-white">X</span>
                        </div>
                    </div>
                </div>
                <h1 className="mt-4 text-center text-2xl font-bold text-gray-800 dark:text-white">
                    XetaSuite
                </h1>
                <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                    Enterprise Resource Planning
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
