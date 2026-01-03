import { useState, useEffect, type FC } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
    FaArrowLeft,
    FaScrewdriverWrench,
    FaCalendar,
    FaUser,
    FaPenToSquare,
    FaCubes,
    FaEnvelope,
    FaPhone,
    FaLocationDot
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb } from "@/shared/components/common";
import { Button, LinkedName } from "@/shared/components/ui";
import { NotFoundContent } from "@/shared/components/errors";
import { CompanyManager } from "../services";
import { CompanyModal } from "./CompanyModal";
import { CompanyRelatedTabs } from "../components";
import type { Company, CompanyStats } from "../types";
import { formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth/hooks";
import { useModal, useTheme } from "@/shared/hooks";

const CompanyDetailPage: FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const companyId = Number(id);
    const { hasPermission, isOnHeadquarters } = useAuth();
    const { theme } = useTheme();

    // Company state
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);
    const [companyError, setCompanyError] = useState<string | null>(null);

    // Stats state
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Modal
    const editModal = useModal();

    // Permissions
    const canUpdate = isOnHeadquarters && hasPermission('company.update');
    const canViewCreator = isOnHeadquarters && hasPermission('user.view');

    // Chart colors
    const chartColors = ['#465fff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const isDark = theme === 'dark';

    // Fetch company details
    useEffect(() => {
        const fetchCompany = async () => {
            if (!companyId) return;

            setIsLoadingCompany(true);
            setCompanyError(null);
            const result = await CompanyManager.getById(companyId);
            if (result.success && result.data) {
                setCompany(result.data.data);
            } else {
                setCompanyError(result.error || t("errors.generic"));
            }
            setIsLoadingCompany(false);
        };

        fetchCompany();
    }, [companyId, t]);

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!companyId) return;

            setIsLoadingStats(true);
            const result = await CompanyManager.getStats(companyId);
            if (result.success && result.data) {
                setStats(result.data.data);
            }
            setIsLoadingStats(false);
        };

        fetchStats();
    }, [companyId]);

    const handleEditSuccess = async () => {
        const result = await CompanyManager.getById(companyId);
        if (result.success && result.data) {
            setCompany(result.data.data);
        }
    };

    // Chart configurations
    const siteChartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            fontFamily: 'Outfit, sans-serif',
            toolbar: { show: false },
            background: 'transparent',
        },
        colors: chartColors,
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                barHeight: '60%',
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: stats?.maintenances_by_site.map(s => s.site_name) || [],
            labels: {
                style: { colors: isDark ? '#9ca3af' : '#6b7280' },
            },
        },
        yaxis: {
            labels: {
                style: { colors: isDark ? '#9ca3af' : '#6b7280' },
            },
        },
        grid: {
            borderColor: isDark ? '#374151' : '#e5e7eb',
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
        },
    };

    const typeChartOptions: ApexOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'Outfit, sans-serif',
            background: 'transparent',
        },
        colors: chartColors,
        labels: stats?.maintenances_by_type.map(t => t.type_label) || [],
        legend: {
            position: 'bottom',
            labels: { colors: isDark ? '#9ca3af' : '#6b7280' },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(0)}%`,
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
        },
        stroke: {
            show: false,
        },
    };

    const statusChartOptions: ApexOptions = {
        chart: {
            type: 'pie',
            fontFamily: 'Outfit, sans-serif',
            background: 'transparent',
        },
        colors: ['#10b981', '#f59e0b', '#465fff', '#ef4444'],
        labels: stats?.maintenances_by_status.map(s => s.status_label) || [],
        legend: {
            position: 'bottom',
            labels: { colors: isDark ? '#9ca3af' : '#6b7280' },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(0)}%`,
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
        },
        stroke: {
            show: false,
        },
    };

    const monthChartOptions: ApexOptions = {
        chart: {
            type: 'area',
            fontFamily: 'Outfit, sans-serif',
            toolbar: { show: false },
            background: 'transparent',
        },
        colors: ['#465fff'],
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.4,
                opacityTo: 0.1,
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: stats?.maintenances_by_month.map(m => m.month) || [],
            labels: {
                style: { colors: isDark ? '#9ca3af' : '#6b7280' },
            },
        },
        yaxis: {
            labels: {
                style: { colors: isDark ? '#9ca3af' : '#6b7280' },
            },
        },
        grid: {
            borderColor: isDark ? '#374151' : '#e5e7eb',
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
        },
    };

    // Loading state for company
    if (isLoadingCompany) {
        return (
            <>
                <PageMeta title={`${t("common.loading")} | XetaSuite`} description={t("common.loading")} />
                <div className="flex h-96 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
            </>
        );
    }

    // Error state for company (404 - not found)
    if (companyError || !company) {
        return (
            <>
                <PageMeta title={`${t("errors.notFound")} | XetaSuite`} description={t("errors.pageNotFound")} />
                <NotFoundContent
                    title={t("companies.notFound")}
                    message={t("companies.notFoundMessage")}
                    backTo="/companies"
                    backLabel={t("companies.detail.backToList")}
                />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`${company.name} | ${t("companies.title")} | XetaSuite`}
                description={company.description || t("companies.description")}
            />
            <PageBreadcrumb
                pageTitle={company.name}
                breadcrumbs={[{ label: t("companies.title"), path: "/companies" }, { label: company.name }]}
            />

            {/* Company Info Card */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <Link
                                to="/companies"
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                title={t("common.back")}
                            >
                                <FaArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{company.name}</h1>
                        </div>
                        {company.description && <p className="mt-3 text-gray-600 dark:text-gray-400">{company.description}</p>}

                        {/* Contact Information */}
                        {(company.email || company.phone || company.address) && (
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {company.email && (
                                    <a
                                        href={`mailto:${company.email}`}
                                        className="inline-flex items-center gap-2 hover:text-brand-500 dark:hover:text-brand-400"
                                    >
                                        <FaEnvelope className="h-4 w-4" />
                                        {company.email}
                                    </a>
                                )}
                                {company.phone && (
                                    <a
                                        href={`tel:${company.phone}`}
                                        className="inline-flex items-center gap-2 hover:text-brand-500 dark:hover:text-brand-400"
                                    >
                                        <FaPhone className="h-4 w-4" />
                                        {company.phone}
                                    </a>
                                )}
                                {company.address && (
                                    <span className="inline-flex items-center gap-2">
                                        <FaLocationDot className="h-4 w-4" />
                                        {company.address}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {canUpdate && (
                        <Button
                            variant="outline"
                            size="sm"
                            startIcon={<FaPenToSquare className="h-4 w-4" />}
                            onClick={() => editModal.openModal()}
                        >
                            {t("common.edit")}
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className={`mt-6 grid grid-cols-1 gap-4 ${company.is_item_provider ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
                    {company.is_item_provider && (
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                                <FaCubes className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{company.item_count}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t("companies.detail.totalItems")}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-500/20">
                            <FaScrewdriverWrench className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{company.maintenance_count}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("companies.detail.totalMaintenances")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 dark:bg-success-500/20">
                            <FaUser className="h-5 w-5 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <LinkedName
                                canView={canViewCreator}
                                id={company.creator?.id}
                                name={company.creator?.full_name}
                                basePath="users" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.creator")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
                            <FaCalendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(company.created_at)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.createdAt")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            {!isLoadingStats && stats && stats.total_maintenances > 0 && (
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Maintenances by Site */}
                    {stats.maintenances_by_site.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                                {t("companies.detail.charts.bySite")}
                            </h3>
                            <Chart
                                options={siteChartOptions}
                                series={[{ data: stats.maintenances_by_site.map(s => s.count) }]}
                                type="bar"
                                height={Math.max(200, stats.maintenances_by_site.length * 40)}
                            />
                        </div>
                    )}

                    {/* Maintenances by Type */}
                    {stats.maintenances_by_type.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                                {t("companies.detail.charts.byType")}
                            </h3>
                            <Chart
                                options={typeChartOptions}
                                series={stats.maintenances_by_type.map(t => t.count)}
                                type="donut"
                                height={280}
                            />
                        </div>
                    )}

                    {/* Maintenances by Status */}
                    {stats.maintenances_by_status.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                                {t("companies.detail.charts.byStatus")}
                            </h3>
                            <Chart
                                options={statusChartOptions}
                                series={stats.maintenances_by_status.map(s => s.count)}
                                type="pie"
                                height={280}
                            />
                        </div>
                    )}

                    {/* Maintenances by Month */}
                    {stats.maintenances_by_month.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                                {t("companies.detail.charts.byMonth")}
                            </h3>
                            <Chart
                                options={monthChartOptions}
                                series={[{ name: t("companies.maintenances"), data: stats.maintenances_by_month.map(m => m.count) }]}
                                type="area"
                                height={280}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Related Tabs (Items, Maintenances) */}
            <CompanyRelatedTabs company={company} />

            {/* Edit Modal */}
            <CompanyModal
                isOpen={editModal.isOpen}
                onClose={editModal.closeModal}
                company={company}
                onSuccess={handleEditSuccess}
            />
        </>
    );
};

export default CompanyDetailPage;
