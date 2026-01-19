import { type FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ItemMonthlyStats } from "../types";

interface ItemStatsChartProps {
    stats: ItemMonthlyStats[];
}

export const ItemStatsChart: FC<ItemStatsChartProps> = ({ stats }) => {
    const { t, i18n } = useTranslation();

    // Sort stats by month and format labels
    const { labels, entries, exits } = useMemo(() => {
        if (!stats || stats.length === 0) {
            return { labels: [], entries: [], exits: [] };
        }

        const sortedStats = [...stats].sort((a, b) => a.month.localeCompare(b.month));

        return {
            labels: sortedStats.map((s) => {
                const [year, month] = s.month.split("-");
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString(i18n.language, {
                    month: "short",
                    year: "2-digit",
                });
            }),
            entries: sortedStats.map((s) => s.entries),
            exits: sortedStats.map((s) => s.exits),
        };
    }, [stats, i18n.language]);

    const chartOptions: ApexOptions = useMemo(
        () => ({
            colors: ["#22c55e", "#ef4444"], // success, error
            chart: {
                fontFamily: "Outfit, sans-serif",
                type: "bar",
                height: 280,
                toolbar: {
                    show: false,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    borderRadius: 4,
                    borderRadiusApplication: "end",
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ["transparent"],
            },
            xaxis: {
                categories: labels,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            legend: {
                show: true,
                position: "top",
                horizontalAlign: "left",
                fontFamily: "Outfit",
            },
            yaxis: {
                title: {
                    text: undefined,
                },
                labels: {
                    formatter: (val: number) => Math.round(val).toString(),
                },
            },
            grid: {
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: (val: number) => `${val}`,
                },
            },
        }),
        [labels]
    );

    const series = useMemo(
        () => [
            {
                name: t("items.stats.entries"),
                data: entries,
            },
            {
                name: t("items.stats.exits"),
                data: exits,
            },
        ],
        [entries, exits, t]
    );

    if (stats.length === 0) {
        return (
            <div className="flex items-center justify-center h-70 text-gray-500 dark:text-gray-400">
                {t("items.stats.noData")}
            </div>
        );
    }

    return (
        <div className="h-70">
            <Chart
                options={chartOptions}
                series={series}
                type="bar"
                height="100%"
            />
        </div>
    );
};
