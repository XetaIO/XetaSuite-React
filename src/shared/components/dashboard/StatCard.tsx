import { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
        inverted?: boolean;
    };
    color?: "brand" | "success" | "warning" | "error" | "info";
    isLoading?: boolean;
}

const colorClasses = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    success: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    warning: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    error: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
    info: "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/10 dark:text-blue-light-400",
};

export default function StatCard({ title, value, icon, trend, color = "brand", isLoading = false }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
            <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                {!isLoading && trend && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trend.inverted ? (trend.isPositive
                            ? "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                            : "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400") : (trend.isPositive
                                ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                                : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400")
                            }`}
                    >
                        <svg
                            className={`h-3 w-3 ${trend.isPositive ? "" : "rotate-180"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        {Math.abs(trend.value)}%
                    </span>
                )}
            </div>
            <div className="mt-4">
                {isLoading ? (
                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                ) : (
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h4>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
            </div>
        </div>
    );
}
