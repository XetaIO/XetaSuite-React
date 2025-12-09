import { type FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
    FaArrowTrendUp,
    FaArrowTrendDown,
    FaChartLine,
    FaEquals,
    FaMoneyBill,
} from "react-icons/fa6";
import { formatCurrency } from "@/shared/utils";
import type { ItemPriceHistory } from "../types";

interface ItemPriceHistoryChartProps {
    priceHistory: ItemPriceHistory | null;
    currency: string;
    isLoading?: boolean;
}

export const ItemPriceHistoryChart: FC<ItemPriceHistoryChartProps> = ({
    priceHistory,
    currency,
    isLoading = false,
}) => {
    const { t, i18n } = useTranslation();

    // Prepare chart data
    const { labels, prices } = useMemo(() => {
        if (!priceHistory?.history || priceHistory.history.length === 0) {
            return { labels: [], prices: [] };
        }

        return {
            labels: priceHistory.history.map((entry) => {
                const date = new Date(entry.effective_date);
                return date.toLocaleDateString(i18n.language, {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                });
            }),
            prices: priceHistory.history.map((entry) => entry.price),
        };
    }, [priceHistory, i18n.language]);

    const chartOptions: ApexOptions = useMemo(
        () => ({
            colors: ["#465fff"],
            chart: {
                fontFamily: "Outfit, sans-serif",
                type: "area",
                height: 280,
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 3,
            },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.1,
                    stops: [0, 90, 100],
                },
            },
            xaxis: {
                categories: labels,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    rotate: -45,
                    rotateAlways: labels.length > 8,
                },
            },
            yaxis: {
                labels: {
                    formatter: (val: number) => formatCurrency(val, currency),
                },
            },
            grid: {
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            tooltip: {
                y: {
                    formatter: (val: number) => formatCurrency(val, currency),
                },
            },
            markers: {
                size: 4,
                strokeWidth: 2,
                hover: {
                    size: 6,
                },
            },
        }),
        [labels, currency]
    );

    const series = useMemo(
        () => [
            {
                name: t("items.priceHistory.price"),
                data: prices,
            },
        ],
        [prices, t]
    );

    // Get trend icon and color based on price change
    const getTrendInfo = () => {
        if (!priceHistory?.stats) return { icon: FaEquals, color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-800/50" };

        const change = priceHistory.stats.price_change_percent;
        if (change > 0) {
            return {
                icon: FaArrowTrendUp,
                color: "text-error-600 dark:text-error-400",
                bgColor: "bg-error-100 dark:bg-error-500/20",
            };
        } else if (change < 0) {
            return {
                icon: FaArrowTrendDown,
                color: "text-success-600 dark:text-success-400",
                bgColor: "bg-success-100 dark:bg-success-500/20",
            };
        }
        return {
            icon: FaEquals,
            color: "text-gray-500 dark:text-gray-400",
            bgColor: "bg-gray-100 dark:bg-gray-800/50",
        };
    };

    const trend = getTrendInfo();
    const TrendIcon = trend.icon;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {/* Stats skeleton */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="mt-2 h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                    ))}
                </div>
                {/* Chart skeleton */}
                <div className="h-[280px] animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
        );
    }

    if (!priceHistory || priceHistory.history.length === 0) {
        return (
            <div className="flex h-[280px] items-center justify-center text-gray-500 dark:text-gray-400">
                {t("items.priceHistory.noData")}
            </div>
        );
    }

    const stats = priceHistory.stats;

    return (
        <div className="space-y-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* Current Price */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                        <FaMoneyBill className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stats.current_price, currency)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("items.priceHistory.currentPrice")}
                        </p>
                    </div>
                </div>

                {/* Average Price */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                        <FaChartLine className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stats.average_price, currency)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("items.priceHistory.averagePrice")}
                        </p>
                    </div>
                </div>

                {/* Min/Max Price */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-500/20">
                        <span className="text-sm font-bold text-warning-600 dark:text-warning-400">
                            ↕
                        </span>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stats.min_price, currency)} - {formatCurrency(stats.max_price, currency)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("items.priceHistory.minMax")}
                        </p>
                    </div>
                </div>

                {/* Price Change */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${trend.bgColor}`}>
                        <TrendIcon className={`h-5 w-5 ${trend.color}`} />
                    </div>
                    <div>
                        <p className={`text-lg font-semibold ${trend.color}`}>
                            {stats.price_change >= 0 ? "+" : ""}
                            {stats.price_change_percent}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("items.priceHistory.evolution")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[280px]">
                <Chart
                    options={chartOptions}
                    series={series}
                    type="area"
                    height="100%"
                />
            </div>
        </div>
    );
};
