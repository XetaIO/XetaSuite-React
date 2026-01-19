import { useEffect, useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';
import { DashboardRepository } from '../services';
import type { MaintenancesEvolution } from '../types';

// Maintenance type colors matching the screenshot
const MAINTENANCE_COLORS = {
    corrective: '#f97316', // Orange
    preventive: '#22c55e', // Green (success)
    inspection: '#eab308', // Yellow (warning)
    improvement: '#465fff', // Blue (brand color)
} as const;

interface MaintenanceEvolutionChartProps {
    className?: string;
}

export function MaintenanceEvolutionChart({ className }: MaintenanceEvolutionChartProps) {
    const { t } = useTranslation();
    const [data, setData] = useState<MaintenancesEvolution | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        corrective: true,
        preventive: true,
        inspection: true,
        improvement: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const chartsData = await DashboardRepository.getChartsData();
                setData(chartsData.maintenances_evolution);
            } catch (err) {
                setError('Failed to load chart data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleSeries = (type: keyof typeof MAINTENANCE_COLORS) => {
        setVisibleSeries(prev => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const series = useMemo(() => {
        if (!data) return [];

        const allSeries: Array<{ name: string; data: number[]; seriesType: keyof typeof MAINTENANCE_COLORS }> = [
            {
                name: t('maintenances.type.corrective'),
                data: data.corrective,
                seriesType: 'corrective',
            },
            {
                name: t('maintenances.type.preventive'),
                data: data.preventive,
                seriesType: 'preventive',
            },
            {
                name: t('maintenances.type.inspection'),
                data: data.inspection,
                seriesType: 'inspection',
            },
            {
                name: t('maintenances.type.improvement'),
                data: data.improvement,
                seriesType: 'improvement',
            },
        ];

        // Filter and return only name + data for ApexCharts
        const result = allSeries
            .filter(s => visibleSeries[s.seriesType])
            .map(({ name, data }) => ({ name, data }));

        return result;
    }, [data, visibleSeries, t]);

    const colors = useMemo(() => {
        const allTypes: (keyof typeof MAINTENANCE_COLORS)[] = ['corrective', 'preventive', 'inspection', 'improvement'];
        return allTypes
            .filter(type => visibleSeries[type])
            .map(type => MAINTENANCE_COLORS[type]);
    }, [visibleSeries]);

    const options: ApexOptions = useMemo(() => ({
        legend: {
            show: false, // We use custom legend
        },
        colors,
        chart: {
            fontFamily: 'Outfit, sans-serif',
            height: 310,
            type: 'area',
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 300,
            },
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.45,
                opacityTo: 0.05,
                shadeIntensity: 1,
                stops: [0, 100],
            },
        },
        markers: {
            size: 0,
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
        grid: {
            borderColor: 'rgba(107, 114, 128, 0.2)',
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
            shared: true,
            intersect: false,
            theme: 'dark',
            y: {
                formatter: (value: number) => `${value} ${t('common.maintenances', { count: value })}`,
            },
        },
        xaxis: {
            type: 'category',
            categories: data?.months ?? [],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    colors: ['#6B7280'],
                },
                formatter: (value: number) => Math.round(value).toString(),
            },
            min: 0,
        },
    }), [data?.months, colors, t]);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-77.5 ${className ?? ''}`}>
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center h-77.5 ${className ?? ''}`}>
                <p className="text-error-500">{error}</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
                {(Object.keys(MAINTENANCE_COLORS) as (keyof typeof MAINTENANCE_COLORS)[]).map(type => (
                    <button
                        key={type}
                        onClick={() => toggleSeries(type)}
                        className={`flex items-center gap-2 text-sm transition-opacity ${visibleSeries[type] ? 'opacity-100' : 'opacity-40'
                            }`}
                    >
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: MAINTENANCE_COLORS[type] }}
                        />
                        <span
                            className={`font-medium ${visibleSeries[type] ? '' : 'line-through'}`}
                            style={{ color: MAINTENANCE_COLORS[type] }}
                        >
                            {t(`maintenances.type.${type}`)}
                        </span>
                        {visibleSeries[type] && (
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" style={{ color: MAINTENANCE_COLORS[type] }}>
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="max-w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
                <div className="min-w-200">
                    <Chart
                        options={options}
                        series={series}
                        type="area"
                        height={310}
                    />
                </div>
            </div>
        </div>
    );
}
