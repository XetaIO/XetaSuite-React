import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { LowStockItem } from "../../../features/Dashboard/types";
import { ItemManager } from "@/features/Items/services";
import { Badge } from "@/shared/components/ui";

interface LowStockItemsCardProps {
    items: LowStockItem[];
    isLoading?: boolean;
}

export default function LowStockItemsCard({ items, isLoading = false }: LowStockItemsCardProps) {
    const { t } = useTranslation();

    const getStockPercentage = (current: number, min: number) => {
        return Math.min((current / min) * 100, 100);
    };

    const getStockColor = (stock_status: string) => {
        if (stock_status === "critical") return "bg-error-500";
        if (stock_status === "warning") return "bg-orange-500";
        return "bg-success-500";
    };

    return (
        <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
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
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="mt-1 h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                </div>
                                <div className="mt-2 h-2 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))
                    ) : items.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            {t('dashboard.lowStock.noItems')}
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                            <Link to={`/items/${item.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                                                {item.name}
                                            </Link>
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.reference}
                                        </p>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {item.current_stock} / {item.min_stock} {t('common.units')}
                                        </span>
                                        <Badge color={item.stock_status_color} size="sm">
                                            {t(ItemManager.getStockStatusLabelKey(item.stock_status))}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div
                                        className={`h-2 rounded-full transition-all ${getStockColor(item.stock_status)}`}
                                        style={{ width: `${getStockPercentage(item.current_stock, item.min_stock)}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export type { LowStockItem };
