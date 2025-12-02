import { useTranslation } from "react-i18next";

interface LowStockItem {
    id: number;
    name: string;
    sku: string;
    currentStock: number;
    minStock: number;
    unit: string;
}

interface LowStockItemsCardProps {
    items: LowStockItem[];
}

export default function LowStockItemsCard({ items }: LowStockItemsCardProps) {
    const { t } = useTranslation();

    const getStockPercentage = (current: number, min: number) => {
        return Math.min((current / min) * 100, 100);
    };

    const getStockColor = (current: number, min: number) => {
        const percentage = getStockPercentage(current, min);
        if (percentage <= 25) return "bg-error-500";
        if (percentage <= 50) return "bg-orange-500";
        return "bg-success-500";
    };

    return (
        <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    {t('dashboard.lowStock.title')}
                </h3>
                <span className="rounded-full bg-error-50 px-2.5 py-1 text-xs font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">
                    {t('dashboard.lowStock.itemsCount', { count: items.length })}
                </span>
            </div>
            <div className="p-4">
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        SKU: {item.sku}
                                    </p>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.currentStock} / {item.minStock} {item.unit}
                                </span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className={`h-2 rounded-full transition-all ${getStockColor(item.currentStock, item.minStock)}`}
                                    style={{ width: `${getStockPercentage(item.currentStock, item.minStock)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export type { LowStockItem };
