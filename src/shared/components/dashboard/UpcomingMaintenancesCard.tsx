import { useTranslation } from "react-i18next";

interface Maintenance {
    id: number;
    title: string;
    location: string;
    date: string;
    priority: "low" | "medium" | "high";
    type: "preventive" | "corrective";
}

const priorityColors = {
    low: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    medium: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    high: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
};

interface UpcomingMaintenancesCardProps {
    maintenances: Maintenance[];
    isLoading?: boolean;
}

export default function UpcomingMaintenancesCard({ maintenances, isLoading = false }: UpcomingMaintenancesCardProps) {
    const { t } = useTranslation();

    const priorityLabels = {
        low: t('dashboard.maintenances.priority.low'),
        medium: t('dashboard.maintenances.priority.medium'),
        high: t('dashboard.maintenances.priority.high'),
    };

    const typeLabels = {
        preventive: t('dashboard.maintenances.type.preventive'),
        corrective: t('dashboard.maintenances.type.corrective'),
    };

    return (
        <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/5">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    {t('dashboard.maintenances.upcoming')}
                </h3>
            </div>
            <div className="p-4">
                <div className="space-y-3">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/3">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
                                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
                                <div className="mt-1 h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
                            </div>
                        ))
                    ) : maintenances.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            {t('dashboard.maintenances.noUpcoming')}
                        </div>
                    ) : (
                        maintenances.map((maintenance) => (
                            <div
                                key={maintenance.id}
                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {maintenance.title}
                                        </h4>
                                        <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-white/10 dark:text-white/60">
                                            {typeLabels[maintenance.type]}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        📍 {maintenance.location}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                                        📅 {maintenance.date}
                                    </p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${priorityColors[maintenance.priority]}`}>
                                    {priorityLabels[maintenance.priority]}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export type { Maintenance };
