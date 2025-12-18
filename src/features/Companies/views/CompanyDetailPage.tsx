import { useState, useEffect, useCallback, type FC } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
    FaArrowLeft,
    FaArrowUp,
    FaArrowDown,
    FaMagnifyingGlass,
    FaWrench,
    FaCalendar,
    FaUser,
    FaPenToSquare
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, Button, LinkedName } from "@/shared/components/ui";
import type { BadgeColor } from "@/shared/components/ui/badge/Badge";
import { NotFoundContent } from "@/shared/components/errors";
import { CompanyManager } from "../services";
import { CompanyModal } from "./CompanyModal";
import type { Company, CompanyMaintenance, MaintenanceFilters, CompanyStats } from "../types";
import type { PaginationMeta } from "@/shared/types";
import { formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth/hooks";
import { useModal, useTheme } from "@/shared/hooks";

type SortField = "type" | "status" | "started_at" | "resolved_at";
type SortDirection = "asc" | "desc";

const CompanyDetailPage: FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const companyId = Number(id);
    const { hasPermission } = useAuth();
    const { theme } = useTheme();

    // Company state
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);
    const [companyError, setCompanyError] = useState<string | null>(null);

    // Stats state
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Maintenances state
    const [maintenances, setMaintenances] = useState<CompanyMaintenance[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoadingMaintenances, setIsLoadingMaintenances] = useState(true);
    const [maintenancesError, setMaintenancesError] = useState<string | null>(null);

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Modal
    const editModal = useModal();

    // Permissions
    const canUpdate = hasPermission('company.update');
    const canViewCreator = hasPermission('user.view');
    const canViewMaterial = hasPermission('material.view');
    const canViewMaintenance = hasPermission('maintenance.view');
    const canViewSite = hasPermission('site.view');

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

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch maintenances
    const fetchMaintenances = useCallback(
        async (filters: MaintenanceFilters) => {
            if (!companyId) return;

            setIsLoadingMaintenances(true);
            setMaintenancesError(null);
            const result = await CompanyManager.getMaintenances(companyId, filters);
            if (result.success && result.data) {
                setMaintenances(result.data.data);
                setMeta(result.data.meta);
            } else {
                setMaintenancesError(result.error || t("errors.generic"));
            }
            setIsLoadingMaintenances(false);
        },
        [companyId, t]
    );

    useEffect(() => {
        const filters: MaintenanceFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchMaintenances(filters);
    }, [currentPage, debouncedSearch, sortBy, sortDirection, fetchMaintenances]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

    const renderSortIcon = (field: SortField) => {
        if (sortBy !== field) {
            return (
                <span className="ml-1 text-gray-300 dark:text-gray-600">
                    <FaArrowUp className="h-3 w-3" />
                </span>
            );
        }
        return sortDirection === "asc" ? (
            <FaArrowUp className="ml-1 h-3 w-3 text-brand-500" />
        ) : (
            <FaArrowDown className="ml-1 h-3 w-3 text-brand-500" />
        );
    };

    const handleEditSuccess = async () => {
        const result = await CompanyManager.getById(companyId);
        if (result.success && result.data) {
            setCompany(result.data.data);
        }
    };

    const getStatusColor = (status: string): BadgeColor => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'planned': return 'brand';
            case 'canceled': return 'error';
            default: return 'light';
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
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                            <FaWrench className="h-5 w-5 text-brand-600 dark:text-brand-400" />
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-500/20">
                            <FaCalendar className="h-5 w-5 text-warning-600 dark:text-warning-400" />
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

            {/* Maintenances Table */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{t("companies.detail.maintenancesListTitle")}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("companies.detail.maintenancesListDescription", { name: company.name })}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("companies.detail.searchMaintenances")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title={t("common.clearSearch")}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {maintenancesError && (
                    <div className="mx-6 mt-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                        {maintenancesError}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-800">
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("companies.detail.maintenance")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("companies.detail.material")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("companies.detail.site")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("type")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("companies.detail.type")}
                                        {renderSortIcon("type")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("status")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("companies.detail.status")}
                                        {renderSortIcon("status")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("started_at")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("companies.detail.startedAt")}
                                        {renderSortIcon("started_at")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("resolved_at")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("common.resolvedAt")}
                                        {renderSortIcon("resolved_at")}
                                    </button>
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingMaintenances ? (
                                [...Array(5)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : maintenances.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={7}>
                                        {debouncedSearch ? (
                                            <div>
                                                <p>{t("companies.detail.noMaintenancesFor", { search: debouncedSearch })}</p>
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t("common.clearSearch")}
                                                </button>
                                            </div>
                                        ) : (
                                            t("companies.detail.noMaintenances")
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                maintenances.map((maintenance) => (
                                    <TableRow
                                        key={maintenance.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewMaintenance}
                                                id={maintenance.id}
                                                name={`#${maintenance.id} - ${maintenance.description}`}
                                                basePath="maintenances"
                                                className="line-clamp-2" />
                                            {maintenance.reason && (
                                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {maintenance.reason}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div>
                                                <LinkedName
                                                    canView={canViewMaterial}
                                                    id={maintenance.material?.id}
                                                    name={maintenance.material?.name || maintenance.material_name}
                                                    basePath="materials" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewSite}
                                                id={maintenance.site?.id}
                                                name={maintenance.site?.name}
                                                basePath="sites"
                                                className="line-clamp-2" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge color="light" size="sm">
                                                {maintenance.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color={getStatusColor(maintenance.status)} size="sm">
                                                {maintenance.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {maintenance.started_at ? formatDate(maintenance.started_at) : '—'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {maintenance.resolved_at ? formatDate(maintenance.resolved_at) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
            </div>

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
