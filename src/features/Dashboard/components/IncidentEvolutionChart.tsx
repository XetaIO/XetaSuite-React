import { useEffect, useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';
import { DashboardRepository } from '../services';
import type { IncidentsEvolution } from '../types';

// Incident severity colors matching the screenshot
const SEVERITY_COLORS = {
    low: '#22c55e',      // Green (success)
    medium: '#eab308',   // Yellow (warning)
    high: '#f97316',     // Orange
    critical: '#ef4444', // Red (error)
} as const;

interface IncidentEvolutionChartProps {
    className?: string;
}

export function IncidentEvolutionChart({ className }: IncidentEvolutionChartProps) {
    const { t } = useTranslation();
    const [data, setData] = useState<IncidentsEvolution | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        low: true,
        medium: true,
        high: true,
        critical: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const chartsData = await DashboardRepository.getChartsData();
                setData(chartsData.incidents_evolution);
            } catch (err) {
                console.error('Failed to fetch charts data:', err);
                setError('Failed to load chart data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleSeries = (severity: keyof typeof SEVERITY_COLORS) => {
        setVisibleSeries(prev => ({
            ...prev,
            [severity]: !prev[severity],
        }));
    };

    const series = useMemo(() => {
        if (!data) return [];

        const allSeries: Array<{ name: string; data: number[]; seriesType: keyof typeof SEVERITY_COLORS }> = [
            {
                name: t('dashboard.incidents.severity.low'),
                data: data.low,
                seriesType: 'low',
            },
            {
                name: t('dashboard.incidents.severity.medium'),
                data: data.medium,
                seriesType: 'medium',
            },
            {
                name: t('dashboard.incidents.severity.high'),
                data: data.high,
                seriesType: 'high',
            },
            {
                name: t('dashboard.incidents.severity.critical'),
                data: data.critical,
                seriesType: 'critical',
            },
        ];

        // Filter and return only name + data for ApexCharts
        return allSeries
            .filter(s => visibleSeries[s.seriesType])
            .map(({ name, data }) => ({ name, data }));
    }, [data, visibleSeries, t]);

    const colors = useMemo(() => {
        const allSeverities: (keyof typeof SEVERITY_COLORS)[] = ['low', 'medium', 'high', 'critical'];
        return allSeverities
            .filter(severity => visibleSeries[severity])
            .map(severity => SEVERITY_COLORS[severity]);
    }, [visibleSeries]);

    const options: ApexOptions = useMemo(() => ({
        legend: {
            show: false, // We use custom legend
        },
        colors,
        chart: {
            fontFamily: 'Outfit, sans-serif',
            height: 310,
            type: 'bar',
            stacked: true,
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 500,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '50%',
                borderRadius: 4,
                borderRadiusApplication: 'end',
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
                formatter: (value: number) => `${value} ${t('common.incidents', { count: value })}`,
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
            <div className={`flex items-center justify-center h-[310px] ${className ?? ''}`}>
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center h-[310px] ${className ?? ''}`}>
                <p className="text-error-500">{error}</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
                {(Object.keys(SEVERITY_COLORS) as (keyof typeof SEVERITY_COLORS)[]).map(severity => (
                    <button
                        key={severity}
                        onClick={() => toggleSeries(severity)}
                        className={`flex items-center gap-2 text-sm transition-opacity ${visibleSeries[severity] ? 'opacity-100' : 'opacity-40'
                            }`}
                    >
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: SEVERITY_COLORS[severity] }}
                        />
                        <span
                            className={`font-medium ${visibleSeries[severity] ? '' : 'line-through'}`}
                            style={{ color: SEVERITY_COLORS[severity] }}
                        >
                            {t(`dashboard.incidents.severity.${severity}`)}
                        </span>
                        {visibleSeries[severity] && (
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" style={{ color: SEVERITY_COLORS[severity] }}>
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[600px]">
                    <Chart
                        key={`incident-chart-${series.length}-${data?.months?.join('-') ?? 'empty'}`}
                        options={options}
                        series={series}
                        type="bar"
                        height={310}
                    />
                </div>
            </div>
        </div>
    );
}
