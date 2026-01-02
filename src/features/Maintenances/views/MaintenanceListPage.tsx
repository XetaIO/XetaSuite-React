import { useState, useEffect, type FC } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
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
import { MaintenanceManager } from '../services';
import { MaintenanceModal } from './MaintenanceModal';
import type {
    Maintenance,
    MaintenanceFilters,
    MaintenanceStatus,
    MaintenanceType,
    MaintenanceRealization,
    StatusOption,
    TypeOption,
    RealizationOption,
} from '../types';

const MaintenanceListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [qrScanHandled, setQrScanHandled] = useState(false);

    // Custom filters specific to maintenances
    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | ''>('');
    const [typeFilter, setTypeFilter] = useState<MaintenanceType | ''>('');
    const [realizationFilter, setRealizationFilter] = useState<MaintenanceRealization | ''>('');

    // Filter options
    const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
    const [typeOptions, setTypeOptions] = useState<TypeOption[]>([]);
    const [realizationOptions, setRealizationOptions] = useState<RealizationOption[]>([]);

    // Use shared list hook with custom filters
    const {
        items: maintenances,
        meta,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        handleSort,
        renderSortIcon,
        handlePageChange,
        refresh,
        setCurrentPage,
    } = useListPage<Maintenance, MaintenanceFilters>({
        fetchFn: MaintenanceManager.getAll,
        defaultSortDirection: 'desc',
        additionalFilters: {
            status: statusFilter || undefined,
            type: typeFilter || undefined,
            realization: realizationFilter || undefined,
        },
    });

    // Selected maintenance for edit/delete
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pre-selected material from QR scan
    const [preselectedMaterialId, setPreselectedMaterialId] = useState<number | null>(null);

    // Permissions - maintenance requires NOT being on headquarters
    const permissions = useEntityPermissions("maintenance", { hasPermission, isOnHeadquarters });
    const canViewSite = isOnHeadquarters && hasPermission('site.view');
    const canViewMaterial = hasPermission('material.view');

    // Modals
    const maintenanceModal = useModal();
    const deleteModal = useModal();

    // Load filter options on mount
    useEffect(() => {
        const loadFilterOptions = async () => {
            const [statusResult, typeResult, realizationResult] = await Promise.all([
                MaintenanceManager.getStatusOptions(),
                MaintenanceManager.getTypeOptions(),
                MaintenanceManager.getRealizationOptions(),
            ]);

            if (statusResult.success && statusResult.data) {
                setStatusOptions(statusResult.data);
            }

            if (typeResult.success && typeResult.data) {
                setTypeOptions(typeResult.data);
            }

            if (realizationResult.success && realizationResult.data) {
                setRealizationOptions(realizationResult.data);
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
            setSelectedMaintenance(null);
            maintenanceModal.openModal();
        }
    }, [qrScanHandled, isLoading, searchParams, setSearchParams, permissions.canCreate, maintenanceModal]);

    const handleCreate = () => {
        setSelectedMaintenance(null);
        setPreselectedMaterialId(null);
        maintenanceModal.openModal();
    };

    const handleEdit = (maintenance: Maintenance) => {
        setSelectedMaintenance(maintenance);
        setPreselectedMaterialId(null);
        maintenanceModal.openModal();
    };

    const handleDeleteClick = (maintenance: Maintenance) => {
        setSelectedMaintenance(maintenance);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMaintenance) return;

        setIsDeleting(true);
        const result = await MaintenanceManager.delete(selectedMaintenance.id);
        if (result.success) {
            showSuccess(t('maintenances.messages.deleted'));
            setSelectedMaintenance(null);
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

    const handleModalClose = () => {
        maintenanceModal.closeModal();
        setPreselectedMaterialId(null);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setTypeFilter('');
        setRealizationFilter('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || statusFilter || typeFilter || realizationFilter;

    const getStatusBadgeColor = (status: MaintenanceStatus): 'brand' | 'warning' | 'success' | 'dark' => {
        switch (status) {
            case 'planned':
                return 'brand';
            case 'in_progress':
                return 'warning';
            case 'completed':
                return 'success';
            case 'canceled':
                return 'dark';
            default:
                return 'dark';
        }
    };

    const getTypeBadgeColor = (type: MaintenanceType): 'error' | 'success' | 'brand' | 'warning' => {
        switch (type) {
            case 'corrective':
                return 'error';
            case 'preventive':
                return 'success';
            case 'inspection':
                return 'brand';
            case 'improvement':
                return 'warning';
            default:
                return 'brand';
        }
    };

    const getRealizationBadgeColor = (realization: MaintenanceRealization): 'brand' | 'warning' | 'success' => {
        switch (realization) {
            case 'internal':
                return 'brand';
            case 'external':
                return 'warning';
            case 'both':
                return 'success';
            default:
                return 'brand';
        }
    };

    const getMaintenanceActions = (maintenance: Maintenance) => [
        { ...createActions.edit(() => handleEdit(maintenance), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(maintenance), t), hidden: !permissions.canDelete },
    ];

    return (
        <>
            <PageMeta title={t('maintenances.title')} description={t('maintenances.description')} />
            <PageBreadcrumb pageTitle={t('maintenances.listTitle')} />

            <ListPageCard>
                <ListPageHeader
                    title={t('maintenances.listTitle')}
                    description={t('maintenances.manageMaintenancesAndTheirInformation')}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t('maintenances.create')}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    rightContent={

                        <>
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
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as MaintenanceStatus | '');
                                    setCurrentPage(1);
                                }}
                                title={t('maintenances.filters.allStatuses')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="">{t('maintenances.filters.allStatuses')}</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as MaintenanceType | '');
                                    setCurrentPage(1);
                                }}
                                title={t('maintenances.filters.allTypes')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="">{t('maintenances.filters.allTypes')}</option>
                                {typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={realizationFilter}
                                onChange={(e) => {
                                    setRealizationFilter(e.target.value as MaintenanceRealization | '');
                                    setCurrentPage(1);
                                }}
                                title={t('maintenances.filters.allRealizations')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="">{t('maintenances.filters.allRealizations')}</option>
                                {realizationOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </>
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
                                <StaticTableHeader label={t('maintenances.fields.material')} />
                                <SortableTableHeader
                                    field="type"
                                    label={t('maintenances.fields.type')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="status"
                                    label={t('maintenances.fields.status')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <StaticTableHeader
                                    label={t('maintenances.fields.realization')}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="started_at"
                                    label={t('maintenances.fields.started_at')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                {permissions.hasAnyAction && (
                                    <StaticTableHeader
                                        label={t('common.actions')}
                                        align="right"
                                        className="w-20"
                                    />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows
                                    count={6}
                                    cells={[
                                        { width: 'w-48' },
                                        ...(isOnHeadquarters ? [{ width: 'w-24' }] : []),
                                        { width: 'w-24' },
                                        { width: 'w-16', center: true },
                                        { width: 'w-16', center: true },
                                        { width: 'w-16', center: true },
                                        { width: 'w-24' },
                                        ...(permissions.hasAnyAction ? [{ width: 'w-16', right: true }] : []),
                                    ]}
                                />
                            ) : maintenances.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={permissions.hasAnyAction ? 8 : (isOnHeadquarters ? 7 : 6)}
                                    searchQuery={hasActiveFilters ? searchQuery : ''}
                                    onClearSearch={handleClearFilters}
                                    emptyMessage={t('maintenances.noMaintenancesFor')}
                                />
                            ) : (
                                maintenances.map((maintenance) => (
                                    <TableRow
                                        key={maintenance.id}
                                        className="table-row-hover"
                                    >
                                        <TableCell className="px-6 py-4">
                                            {permissions.canView ? (
                                                <Link
                                                    to={`/maintenances/${maintenance.id}`}
                                                    className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                                                    <span className="line-clamp-2">
                                                        #{maintenance.id} - {maintenance.description}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="line-clamp-2">
                                                    #{maintenance.id} - {maintenance.description}
                                                </span>
                                            )}
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4">
                                                <LinkedName
                                                    canView={canViewSite}
                                                    id={maintenance.site?.id}
                                                    name={maintenance.site?.name}
                                                    basePath="sites" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewMaterial}
                                                id={maintenance.material?.id}
                                                name={maintenance.material?.name}
                                                basePath="materials" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color={getTypeBadgeColor(maintenance.type)} size="md">
                                                {maintenance.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color={getStatusBadgeColor(maintenance.status)} size="md">
                                                {maintenance.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color={getRealizationBadgeColor(maintenance.realization)} size="md">
                                                {maintenance.realization_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {maintenance.started_at ? (
                                                <span>
                                                    {formatDate(maintenance.started_at)}
                                                </span>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getMaintenanceActions(maintenance)} />
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
                {meta && meta.last_page > 1 && (
                    <div className="border-t border-gray-200 p-5 dark:border-gray-800">
                        <Pagination
                            meta={meta}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </ListPageCard>

            {/* Maintenance Modal */}
            <MaintenanceModal
                isOpen={maintenanceModal.isOpen}
                onClose={handleModalClose}
                maintenance={selectedMaintenance}
                onSuccess={handleModalSuccess}
                preselectedMaterialId={preselectedMaterialId}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t('maintenances.deleteTitle')}
                message={t('common.confirmDelete', { name: selectedMaintenance?.description || '' })}
            />
        </>
    );
};

export default MaintenanceListPage;
