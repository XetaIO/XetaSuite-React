import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { MaterialManager } from '../services/MaterialManager';
import type { MaterialMonthlyStats } from '../types';

interface MaterialStatsChartsProps {
    materialId: number;
}

export function MaterialStatsCharts({ materialId }: MaterialStatsChartsProps) {
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState<MaterialMonthlyStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            setIsLoading(true);
            setError(null);

            const result = await MaterialManager.getStats(materialId);

            if (result.success && result.data) {
                setStats(result.data);
            } else {
                setError(result.error || 'Failed to load statistics');
            }

            setIsLoading(false);
        };

        loadStats();
    }, [materialId]);

    // Format month labels based on locale
    const monthLabels = useMemo(() => {
        if (!stats) return [];

        return stats.months.map((month) => {
            const [year, monthNum] = month.split('-');
            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
            return date.toLocaleDateString(i18n.language, { month: 'short' });
        });
    }, [stats, i18n.language]);

    // Bar chart options for Incidents & Maintenances
    const barChartOptions: ApexOptions = useMemo(
        () => ({
            colors: ['#ef4444', '#f59e0b'], // error, warning
            chart: {
                fontFamily: 'Outfit, sans-serif',
                type: 'bar',
                height: 280,
                toolbar: {
                    show: false,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            xaxis: {
                categories: monthLabels,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'left',
                fontFamily: 'Outfit',
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
        [monthLabels]
    );

    // Line/Area chart options for Cleanings & Item Movements
    const lineChartOptions: ApexOptions = useMemo(
        () => ({
            colors: ['#22c55e', '#3b82f6'], // success, brand
            chart: {
                fontFamily: 'Outfit, sans-serif',
                height: 280,
                type: 'area',
                toolbar: {
                    show: false,
                },
            },
            stroke: {
                curve: 'smooth',
                width: [2, 2],
            },
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.4,
                    opacityTo: 0.05,
                },
            },
            markers: {
                size: 0,
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: {
                    size: 5,
                },
            },
            grid: {
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            dataLabels: {
                enabled: false,
            },
            tooltip: {
                enabled: true,
            },
            xaxis: {
                type: 'category',
                categories: monthLabels,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px',
                        colors: ['#6B7280'],
                    },
                    formatter: (val: number) => Math.round(val).toString(),
                },
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'left',
                fontFamily: 'Outfit',
            },
        }),
        [monthLabels]
    );

    const barChartSeries = useMemo(() => {
        if (!stats) return [];
        return [
            {
                name: t('materials.charts.incidents'),
                data: stats.incidents,
            },
            {
                name: t('materials.charts.maintenances'),
                data: stats.maintenances,
            },
        ];
    }, [stats, t]);

    const lineChartSeries = useMemo(() => {
        if (!stats) return [];
        return [
            {
                name: t('materials.charts.cleanings'),
                data: stats.cleanings,
            },
            {
                name: t('materials.charts.itemMovements'),
                data: stats.item_movements,
            },
        ];
    }, [stats, t]);

    if (isLoading) {
        return (
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3"
                    >
                        <div className="mb-4 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-64 rounded bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return null;
    }

    return (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Incidents & Maintenances Bar Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('materials.charts.incidentsMaintenances')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('materials.charts.incidentsMaintenancesDesc')}
                    </p>
                </div>
                <div className="max-w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[500px]">
                        <Chart options={barChartOptions} series={barChartSeries} type="bar" height={280} />
                    </div>
                </div>
            </div>

            {/* Cleanings & Item Movements Line Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('materials.charts.cleaningsItemMovements')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('materials.charts.cleaningsItemMovementsDesc')}
                    </p>
                </div>
                <div className="max-w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[500px]">
                        <Chart options={lineChartOptions} series={lineChartSeries} type="area" height={280} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MaterialStatsCharts;
