import { useTranslation } from "react-i18next";

interface IncidentsSummary {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    bySeverity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

interface IncidentsSummaryCardProps {
    summary: IncidentsSummary;
}

export default function IncidentsSummaryCard({ summary }: IncidentsSummaryCardProps) {
    const { t } = useTranslation();

    const statusItems = [
        { label: t('dashboard.incidents.open'), value: summary.open, color: "bg-error-500" },
        { label: t('dashboard.incidents.inProgress'), value: summary.inProgress, color: "bg-orange-500" },
        { label: t('dashboard.incidents.resolved'), value: summary.resolved, color: "bg-success-500" },
    ];

    const severityItems = [
        { label: t('dashboard.incidents.severity.critical'), value: summary.bySeverity.critical, color: "text-error-600 dark:text-error-400" },
        { label: t('dashboard.incidents.severity.high'), value: summary.bySeverity.high, color: "text-orange-600 dark:text-orange-400" },
        { label: t('dashboard.incidents.severity.medium'), value: summary.bySeverity.medium, color: "text-brand-600 dark:text-brand-400" },
        { label: t('dashboard.incidents.severity.low'), value: summary.bySeverity.low, color: "text-success-600 dark:text-success-400" },
    ];

    return (
        <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    {t('dashboard.incidents.summary')}
                </h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.total}
                </span>
            </div>
            <div className="p-6">
                {/* Progress bar */}
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                    {statusItems.map((item, index) => (
                        <div
                            key={index}
                            className={`${item.color} transition-all`}
                            style={{ width: `${(item.value / summary.total) * 100}%` }}
                        />
                    ))}
                </div>

                {/* Status legend */}
                <div className="mt-4 flex justify-between">
                    {statusItems.map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                            </div>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Severity breakdown */}
                <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.incidents.bySeverity')}</h4>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {severityItems.map((item, index) => (
                            <div key={index} className="text-center">
                                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { IncidentsSummary };
