import { useState, useEffect, type FC } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
    FaMagnifyingGlass,
    FaScrewdriverWrench,
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

type SortField = 'created_at' | 'started_at' | 'status' | 'type';

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
        debouncedSearch,
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
    const permissions = useEntityPermissions("maintenance");
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
            deleteModal.closeModal();
            setSelectedMaintenance(null);
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

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t('maintenances.listTitle')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('maintenances.manageMaintenancesAndTheirInformation')}
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
                                {t('maintenances.create')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
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
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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

                            {/* Type Filter */}
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

                            {/* Realization Filter */}
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
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('common.description')}
                                </TableCell>
                                {isOnHeadquarters && (
                                    <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t('common.site')}
                                    </TableCell>
                                )}
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('maintenances.fields.material')}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort('type')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('maintenances.fields.type')}
                                        {renderSortIcon('type')}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('maintenances.fields.status')}
                                        {renderSortIcon('status')}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('maintenances.fields.realization')}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort('started_at')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('maintenances.fields.started_at')}
                                        {renderSortIcon('started_at')}
                                    </button>
                                </TableCell>
                                {permissions.hasAnyAction && (
                                    <TableCell isHeader className="w-20 px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
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
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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
                            ) : maintenances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={permissions.hasAnyAction ? 8 : (isOnHeadquarters ? 7 : 6)} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FaScrewdriverWrench className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            <p>
                                                {t('maintenances.noMaintenancesFor')}
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t('common.clearFilters')}
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                maintenances.map((maintenance) => (
                                    <TableRow
                                        key={maintenance.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
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
            </div>

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
