import { useState, useEffect, type FC } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
    FaBroom,
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
} from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { SearchInput } from '@/shared/components/form';
import { useModal, useListPage, useEntityPermissions } from '@/shared/hooks';
import { showSuccess, showError, formatDate } from '@/shared/utils';
import { useAuth } from '@/features/Auth';
import { CleaningManager } from '../services';
import { CleaningModal } from './CleaningModal';
import type { Cleaning, CleaningFilters, CleaningType, TypeOption } from '../types';
import type { BadgeColor } from '@/shared/components/ui/badge/Badge';

const CleaningListPage: FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { hasPermission, isOnHeadquarters } = useAuth();
    const [qrScanHandled, setQrScanHandled] = useState(false);

    // Custom filters specific to cleanings
    const [typeFilter, setTypeFilter] = useState<CleaningType | ''>('');

    // Filter options
    const [typeOptions, setTypeOptions] = useState<TypeOption[]>([]);

    // Use shared list hook with custom filters
    const {
        items: cleanings,
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
    } = useListPage<Cleaning, CleaningFilters>({
        fetchFn: CleaningManager.getAll,
        defaultSortDirection: 'desc',
        additionalFilters: {
            type: typeFilter || undefined,
        },
    });

    // Selected cleaning for edit/delete
    const [selectedCleaning, setSelectedCleaning] = useState<Cleaning | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pre-selected material from QR scan
    const [preselectedMaterialId, setPreselectedMaterialId] = useState<number | null>(null);

    // Permissions
    const permissions = useEntityPermissions("cleaning", { hasPermission, isOnHeadquarters });
    const canViewMaterial = hasPermission('material.view');
    const canViewSite = isOnHeadquarters && hasPermission('site.view');
    const canViewCreator = isOnHeadquarters && hasPermission('user.view');

    // Modals
    const cleaningModal = useModal();
    const deleteModal = useModal();

    // Load filter options on mount
    useEffect(() => {
        const loadFilterOptions = async () => {
            const typeResult = await CleaningManager.getTypeOptions();

            if (typeResult.success && typeResult.data) {
                setTypeOptions(typeResult.data);
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
            setSelectedCleaning(null);
            cleaningModal.openModal();
        }
    }, [qrScanHandled, isLoading, searchParams, setSearchParams, permissions.canCreate, cleaningModal]);

    const handleCreate = () => {
        setSelectedCleaning(null);
        setPreselectedMaterialId(null);
        cleaningModal.openModal();
    };

    const handleEdit = (cleaning: Cleaning) => {
        setSelectedCleaning(cleaning);
        setPreselectedMaterialId(null);
        cleaningModal.openModal();
    };

    const handleDeleteClick = (cleaning: Cleaning) => {
        setSelectedCleaning(cleaning);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCleaning) return;

        setIsDeleting(true);
        const result = await CleaningManager.delete(selectedCleaning.id);
        if (result.success) {
            showSuccess(t('cleanings.messages.deleted'));
            deleteModal.closeModal();
            setSelectedCleaning(null);
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
        cleaningModal.closeModal();
        setPreselectedMaterialId(null);
    };

    const getTypeOptions = (): { value: CleaningType | ''; label: string }[] => [
        { value: '', label: t('cleanings.filters.allTypes') },
        ...typeOptions.map((opt) => ({ value: opt.value, label: opt.label })),
    ];

    const getTypeBadge = (type: CleaningType) => {
        const colors: Record<CleaningType, BadgeColor> = {
            daily: 'brand',
            weekly: 'success',
            bimonthly: 'warning',
            monthly: 'warning',
            quarterly: 'light',
            biannual: 'light',
            annual: 'light',
            casual: 'info',
        };
        const typeLabel = typeOptions.find((opt) => opt.value === type)?.label || type;
        return (
            <Badge color={colors[type] || 'light'} size="sm">
                {typeLabel}
            </Badge>
        );
    };

    const getCleaningActions = (cleaning: Cleaning) => [
        { ...createActions.edit(() => handleEdit(cleaning), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(cleaning), t), hidden: !permissions.canDelete },
    ];

    const handleClearFilters = () => {
        setSearchQuery('');
        setTypeFilter('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || typeFilter;

    return (
        <>
            <PageMeta
                title={`${t('cleanings.title')} | XetaSuite`}
                description={t('cleanings.description')}
            />

            <PageBreadcrumb
                pageTitle={t('cleanings.title')}
                breadcrumbs={[{ label: t('cleanings.title') }]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t('cleanings.title')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('cleanings.subtitle')}
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
                                {t('cleanings.create')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t('cleanings.search')}
                        />

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

                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as CleaningType | '');
                                    setCurrentPage(1);
                                }}
                                title={t('cleanings.filters.allTypes')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                {getTypeOptions().map((option) => (
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
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                <StaticTableHeader label={t('cleanings.id')} />
                                <StaticTableHeader label={t('cleanings.material')} />
                                {isOnHeadquarters && (
                                    <StaticTableHeader label={t('cleanings.site')} align="center" />
                                )}
                                <SortableTableHeader
                                    field="type"
                                    label={t('cleanings.type')}
                                    align="center"
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t('common.description')} />
                                <SortableTableHeader
                                    field="created_at"
                                    label={t('cleanings.date')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t('cleanings.createdBy')} />
                                {permissions.hasAnyAction && (
                                    <StaticTableHeader label={t('common.actions')} align="right" className="w-20" />
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
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4">
                                                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
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
                            ) : cleanings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={permissions.hasAnyAction ? 7 : (isOnHeadquarters ? 7 : 6)} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FaBroom className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            <p>
                                                {hasActiveFilters
                                                    ? t('cleanings.empty.withFilters')
                                                    : t('cleanings.empty.noData')}
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
                                cleanings.map((cleaning) => (
                                    <TableRow
                                        key={cleaning.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <LinkedName
                                                canView={permissions.canView}
                                                id={cleaning.id}
                                                name={`#${cleaning.id}`}
                                                basePath="cleanings" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <LinkedName
                                                canView={canViewMaterial}
                                                id={cleaning.material_id}
                                                name={cleaning.material?.name || cleaning.material_name}
                                                basePath="materials" />
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4 text-center">
                                                <LinkedName
                                                    canView={canViewSite}
                                                    id={cleaning.site_id}
                                                    name={cleaning.site?.name}
                                                    basePath="sites" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4 text-center">
                                            {getTypeBadge(cleaning.type)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="line-clamp-2 text-gray-600 dark:text-gray-300">
                                                {cleaning.description}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(cleaning.created_at)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <LinkedName
                                                canView={canViewCreator}
                                                id={cleaning.created_by_id}
                                                name={cleaning.creator?.full_name || cleaning.created_by_name}
                                                basePath="users" />
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4 text-right">
                                                <ActionsDropdown actions={getCleaningActions(cleaning)} />
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
                    <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                        <Pagination
                            meta={meta}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <CleaningModal
                isOpen={cleaningModal.isOpen}
                onClose={handleModalClose}
                cleaning={selectedCleaning}
                onSuccess={handleModalSuccess}
                preselectedMaterialId={preselectedMaterialId}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                title={t('cleanings.delete')}
                message={t('cleanings.deleteConfirm')}
                isLoading={isDeleting}
            />
        </>
    );
};

export default CleaningListPage;
