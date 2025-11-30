import { useTranslation } from "react-i18next";

interface Activity {
    id: number;
    type: "maintenance" | "incident" | "cleaning" | "item";
    title: string;
    description: string;
    time: string;
    status?: "pending" | "completed" | "in_progress";
}

const typeColors = {
    maintenance: "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400",
    incident: "bg-error-100 text-error-600 dark:bg-error-500/20 dark:text-error-400",
    cleaning: "bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400",
    item: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
};

const typeIcons = {
    maintenance: "🔧",
    incident: "⚠️",
    cleaning: "🧹",
    item: "📦",
};

const statusBadges = {
    pending: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    completed: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    in_progress: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
};

interface RecentActivityCardProps {
    activities: Activity[];
}

export default function RecentActivityCard({ activities }: RecentActivityCardProps) {
    const { t } = useTranslation();

    const statusLabels = {
        pending: t('dashboard.activity.status.pending'),
        completed: t('dashboard.activity.status.completed'),
        in_progress: t('dashboard.activity.status.inProgress'),
    };

    return (
        <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    {t('dashboard.activity.title')}
                </h3>
                <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    {t('common.viewAll')}
                </button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColors[activity.type]}`}>
                            <span className="text-lg">{typeIcons[activity.type]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {activity.title}
                                </h4>
                                {activity.status && (
                                    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadges[activity.status]}`}>
                                        {statusLabels[activity.status]}
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                                {activity.description}
                            </p>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {activity.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export type { Activity };
