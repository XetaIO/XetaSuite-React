import { useState, useEffect, type FC } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
    FaMagnifyingGlass,
    FaTriangleExclamation,
} from 'react-icons/fa6';
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from '@/shared/components/common';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    Badge,
    ActionsDropdown,
    createActions,
    LinkedName,
} from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { useModal, useListPage, useEntityPermissions } from '@/shared/hooks';
import { showSuccess, showError, formatDate } from '@/shared/utils';
import { useAuth } from '@/features/Auth';
import { IncidentManager } from '../services';
import { IncidentModal } from './IncidentModal';
import type { Incident, IncidentFilters, IncidentSeverity, IncidentStatus, StatusOption, SeverityOption } from '../types';

type SortField = 'created_at' | 'started_at' | 'severity' | 'status';

const IncidentListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [qrScanHandled, setQrScanHandled] = useState(false);

    // Custom filters specific to incidents
    const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
    const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | ''>('');

    // Filter options
    const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
    const [severityOptions, setSeverityOptions] = useState<SeverityOption[]>([]);

    // Use shared list hook with custom filters
    const {
        items: incidents,
        meta,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        handleSort,
        renderSortIcon,
        handlePageChange,
        refresh,
        setCurrentPage,
    } = useListPage<Incident, IncidentFilters>({
        fetchFn: IncidentManager.getAll,
        defaultSortDirection: 'desc',
        additionalFilters: {
            status: statusFilter || undefined,
            severity: severityFilter || undefined,
        },
    });

    // Selected incident for edit/delete
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pre-selected material from QR scan
    const [preselectedMaterialId, setPreselectedMaterialId] = useState<number | null>(null);

    // Permissions
    const permissions = useEntityPermissions("incident");
    const canViewSite = isOnHeadquarters && hasPermission('site.view');
    const canViewMaterial = hasPermission('material.view');
    const canViewReporter = isOnHeadquarters && hasPermission('user.view');

    // Modals
    const incidentModal = useModal();
    const deleteModal = useModal();

    // Load filter options on mount
    useEffect(() => {
        const loadFilterOptions = async () => {
            const [statusResult, severityResult] = await Promise.all([
                IncidentManager.getStatusOptions(),
                IncidentManager.getSeverityOptions(),
            ]);

            if (statusResult.success && statusResult.data) {
                setStatusOptions(statusResult.data);
            }

            if (severityResult.success && severityResult.data) {
                setSeverityOptions(severityResult.data);
            }
        };

        loadFilterOptions();
    }, []);

    // Handle QR code scan redirect: ?material=X&action=create
    useEffect(() => {
        if (qrScanHandled || isLoading) return;

        const materialParam = searchParams.get('material');
        const actionParam = searchParams.get('action');

        if (materialParam && actionParam === 'create' && permissions.canCreate) {
            setQrScanHandled(true);

            const newParams = new URLSearchParams(searchParams);
            newParams.delete('material');
            newParams.delete('action');
            setSearchParams(newParams, { replace: true });

            setPreselectedMaterialId(parseInt(materialParam, 10));
            setSelectedIncident(null);
            incidentModal.openModal();
        }
    }, [qrScanHandled, isLoading, searchParams, setSearchParams, permissions.canCreate, incidentModal]);

    const handleCreate = () => {
        setSelectedIncident(null);
        incidentModal.openModal();
    };

    const handleEdit = (incident: Incident) => {
        setSelectedIncident(incident);
        incidentModal.openModal();
    };

    const handleDeleteClick = (incident: Incident) => {
        setSelectedIncident(incident);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedIncident) return;

        setIsDeleting(true);
        const result = await IncidentManager.delete(selectedIncident.id);
        if (result.success) {
            showSuccess(t('incidents.messages.deleted'));
            deleteModal.closeModal();
            setSelectedIncident(null);
            refresh();
        } else {
            deleteModal.closeModal();
            showError(result.error || t('errors.generic'));
        }
        setIsDeleting(false);
    };

    const handleModalSuccess = () => {
        refresh();
    };

    const getIncidentActions = (incident: Incident) => [
        { ...createActions.edit(() => handleEdit(incident), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(incident), t), hidden: !permissions.canDelete },
    ];

    const getSeverityBadgeColor = (severity: IncidentSeverity): 'error' | 'warning' | 'brand' | 'success' => {
        switch (severity) {
            case 'critical':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'brand';
            case 'low':
                return 'success';
            default:
                return 'brand';
        }
    };

    const getStatusBadgeColor = (status: IncidentStatus): 'error' | 'warning' | 'success' | 'light' => {
        switch (status) {
            case 'open':
                return 'error';
            case 'in_progress':
                return 'warning';
            case 'resolved':
                return 'success';
            case 'closed':
                return 'light';
            default:
                return 'light';
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setSeverityFilter('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || statusFilter || severityFilter;

    return (
        <>
            <PageMeta title={`${t('incidents.title')} | XetaSuite`} description={t('incidents.description')} />
            <PageBreadcrumb pageTitle={t('incidents.title')} breadcrumbs={[{ label: t('incidents.title') }]} />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t('incidents.listTitle')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('incidents.manageIncidentsAndTheirInformation')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t('incidents.create')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className="relative max-w-md flex-1">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    title={t('common.clearSearch')}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-sm text-brand-500 hover:text-brand-600"
                                >
                                    {t('common.clearFilters')}
                                </button>
                            )}

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                title={t('incidents.status')}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as IncidentStatus | '');
                                    setCurrentPage(1);
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="">{t('incidents.allStatuses')}</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Severity Filter */}
                            <select
                                value={severityFilter}
                                title={t('incidents.severity')}
                                onChange={(e) => {
                                    setSeverityFilter(e.target.value as IncidentSeverity | '');
                                    setCurrentPage(1);
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="">{t('incidents.allSeverities')}</option>
                                {severityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mx-6 mt-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-800">
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t('common.description')}
                                </TableCell>
                                {isOnHeadquarters && (
                                    <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t('common.site')}
                                    </TableCell>
                                )}
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t('incidents.material')}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    <button
                                        onClick={() => handleSort('severity')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('incidents.severity')}
                                        {renderSortIcon('severity')}
                                    </button>
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('incidents.status')}
                                        {renderSortIcon('status')}
                                    </button>
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t('incidents.reportedBy')}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('common.createdAt')}
                                        {renderSortIcon('created_at')}
                                    </button>
                                </TableCell>
                                {permissions.hasAnyAction && (
                                    <TableCell
                                        isHeader
                                        className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        {t('common.actions')}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(8)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4">
                                                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : incidents.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        colSpan={permissions.hasAnyAction ? 7 : (isOnHeadquarters ? 7 : 6)}
                                    >
                                        {debouncedSearch || statusFilter || severityFilter ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <FaTriangleExclamation className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                                <p>{t('incidents.noIncidentsFiltered')}</p>
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t('common.clearFilters')}
                                                </button>
                                            </div>
                                        ) : (
                                            t('incidents.noIncidents')
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                incidents.map((incident) => (
                                    <TableRow
                                        key={incident.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <FaTriangleExclamation className="mt-0.5 h-4 w-4 shrink-0 text-warning-500" />
                                                <div>
                                                    {permissions.canView ? (
                                                        <Link
                                                            to={`/incidents/${incident.id}`}
                                                            className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                                        >
                                                            {incident.description}
                                                            {incident.maintenance && (
                                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    {t('incidents.linkedToMaintenance')}:{' '}
                                                                    <span className="line-clamp-1">
                                                                        {incident.maintenance.description}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                                {incident.description}
                                                            </p>
                                                            {incident.maintenance && (
                                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    {t('incidents.linkedToMaintenance')}:{' '}
                                                                    <span className="line-clamp-1">
                                                                        {incident.maintenance.description}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4">
                                                <LinkedName
                                                    canView={canViewSite}
                                                    id={incident.site_id}
                                                    name={incident.site?.name}
                                                    basePath="sites" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewMaterial}
                                                id={incident.material?.id}
                                                name={incident.material?.name || incident.material_name}
                                                basePath="materials" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color={getSeverityBadgeColor(incident.severity)} size="md">
                                                {incident.severity_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color={getStatusBadgeColor(incident.status)} size="md">
                                                {incident.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewReporter}
                                                id={incident.reporter?.id}
                                                name={incident.reporter?.full_name || incident.reported_by_name}
                                                basePath="users" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(incident.created_at)}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getIncidentActions(incident)} />
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
            </div>

            {/* Create/Edit Modal */}
            <IncidentModal
                isOpen={incidentModal.isOpen}
                onClose={incidentModal.closeModal}
                incident={selectedIncident}
                onSuccess={handleModalSuccess}
                preselectedMaterialId={preselectedMaterialId}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t('incidents.deleteTitle')}
                message={t('incidents.confirmDelete')}
            />
        </>
    );
};

export default IncidentListPage;
