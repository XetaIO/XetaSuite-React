import { useState, useEffect, type FC } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
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
    SortableTableHeader,
    StaticTableHeader,
    Button,
    ListPageCard,
    ListPageHeader,
    SearchSection,
    ErrorAlert,
    TableSkeletonRows,
    EmptyTableRow,
} from '@/shared/components/ui';
import { useModal, useListPage, useEntityPermissions } from '@/shared/hooks';
import { showSuccess, showError, formatDate } from '@/shared/utils';
import { useAuth } from '@/features/Auth';
import { IncidentManager } from '../services';
import { IncidentModal } from './IncidentModal';
import type { Incident, IncidentFilters, IncidentSeverity, IncidentStatus, StatusOption, SeverityOption } from '../types';

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
    const permissions = useEntityPermissions("incident", { hasPermission, isOnHeadquarters });
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
            setSelectedIncident(null);
            refresh();
        } else {
            showError(result.error || t('errors.generic'));
        }
        setIsDeleting(false);
        deleteModal.closeModal();
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

    const skeletonCells = [
        { width: 'w-48' },
        ...(isOnHeadquarters ? [{ width: 'w-24' }] : []),
        { width: 'w-24' },
        { width: 'w-16', centered: true },
        { width: 'w-24' },
        { width: 'w-24' },
        { width: 'w-24' },
        ...(permissions.hasAnyAction ? [{ width: 'w-16', alignRight: true }] : []),
    ];
    const colSpan = 7 + (isOnHeadquarters ? 1 : 0) + (permissions.hasAnyAction ? 1 : 0) - 1;

    return (
        <>
            <PageMeta title={`${t('incidents.title')} | XetaSuite`} description={t('incidents.description')} />
            <PageBreadcrumb pageTitle={t('incidents.title')} breadcrumbs={[{ label: t('incidents.title') }]} />

            <ListPageCard>
                <ListPageHeader
                    title={t('incidents.listTitle')}
                    description={t('incidents.manageIncidentsAndTheirInformation')}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t('incidents.create')}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder={t('common.searchPlaceholder')}
                    rightContent={
                        <div className="flex items-center gap-4">
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-sm text-brand-500 hover:text-brand-600"
                                >
                                    {t('common.clearFilters')}
                                </button>
                            )}

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
                    }
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                <StaticTableHeader label={t('common.description')} />
                                {isOnHeadquarters && (
                                    <StaticTableHeader label={t('common.site')} />
                                )}
                                <StaticTableHeader label={t('incidents.material')} />
                                <SortableTableHeader
                                    field="severity"
                                    label={t('incidents.severity')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="status"
                                    label={t('incidents.status')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <StaticTableHeader label={t('incidents.reportedBy')} />
                                <SortableTableHeader
                                    field="created_at"
                                    label={t('common.createdAt')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                {permissions.hasAnyAction && (
                                    <StaticTableHeader label={t('common.actions')} align="right" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows count={8} cells={skeletonCells} />
                            ) : incidents.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch || statusFilter || severityFilter}
                                    onClearSearch={handleClearFilters}
                                    emptyMessage={t('incidents.noIncidents')}
                                    noResultsMessage={t('incidents.noIncidentsFiltered')}
                                />
                            ) : (
                                incidents.map((incident) => (
                                    <TableRow key={incident.id} className="table-row-hover">
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
            </ListPageCard>

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
