import { useState, useEffect, type FC } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa6';
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
            setSelectedCleaning(null);
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

    const skeletonCells = [
        { width: 'w-48' },
        { width: 'w-24' },
        ...(isOnHeadquarters ? [{ width: 'w-24' }] : []),
        { width: 'w-16', centered: true },
        { width: 'w-24' },
        { width: 'w-24' },
        { width: 'w-24' },
        ...(permissions.hasAnyAction ? [{ width: 'w-16', alignRight: true }] : []),
    ];
    const colSpan = 7 + (isOnHeadquarters ? 1 : 0) + (permissions.hasAnyAction ? 1 : 0) - 1;

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

            <ListPageCard>
                <ListPageHeader
                    title={t('cleanings.title')}
                    description={t('cleanings.subtitle')}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t('cleanings.create')}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder={t('cleanings.search')}
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
                    }
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

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
                                <TableSkeletonRows count={8} cells={skeletonCells} />
                            ) : cleanings.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={hasActiveFilters ? 'filter' : ''}
                                    onClearSearch={handleClearFilters}
                                    emptyMessage={t('cleanings.empty.noData')}
                                    noResultsMessage={t('cleanings.empty.withFilters')}
                                />
                            ) : (
                                cleanings.map((cleaning) => (
                                    <TableRow key={cleaning.id} className="table-row-hover">
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
            </ListPageCard>

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
