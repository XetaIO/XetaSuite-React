import { useState, useEffect, useCallback, type FC } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
    FaMagnifyingGlass,
    FaArrowUp,
    FaArrowDown,
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
} from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { useModal } from '@/shared/hooks';
import { showSuccess, showError, formatDate } from '@/shared/utils';
import { useAuth } from '@/features/Auth';
import { CleaningManager } from '../services';
import { CleaningModal } from './CleaningModal';
import type { Cleaning, CleaningFilters, CleaningType, TypeOption } from '../types';
import type { PaginationMeta } from '@/shared/types';
import type { BadgeColor } from '@/shared/components/ui/badge/Badge';

type SortField = 'created_at' | 'type' | 'material_name';
type SortDirection = 'asc' | 'desc';

const CleaningListPage: FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { hasPermission } = useAuth();
    const [cleanings, setCleanings] = useState<Cleaning[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrScanHandled, setQrScanHandled] = useState(false);

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [typeFilter, setTypeFilter] = useState<CleaningType | ''>('');

    // Filter options
    const [typeOptions, setTypeOptions] = useState<TypeOption[]>([]);

    // Selected cleaning for edit/delete
    const [selectedCleaning, setSelectedCleaning] = useState<Cleaning | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pre-selected material from QR scan
    const [preselectedMaterialId, setPreselectedMaterialId] = useState<number | null>(null);

    // Permissions
    const canCreate = hasPermission('cleaning.create');
    const canUpdate = hasPermission('cleaning.update');
    const canDelete = hasPermission('cleaning.delete');

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

        if (materialParam && actionParam === 'create' && canCreate) {
            // Mark as handled to prevent re-execution
            setQrScanHandled(true);

            // Clear URL params
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('material');
            newParams.delete('action');
            setSearchParams(newParams, { replace: true });

            // Set preselected material and open modal
            setPreselectedMaterialId(parseInt(materialParam, 10));
            setSelectedCleaning(null);
            cleaningModal.openModal();
        }
    }, [qrScanHandled, isLoading, searchParams, setSearchParams, canCreate, cleaningModal]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchCleanings = useCallback(
        async (filters: CleaningFilters) => {
            setIsLoading(true);
            setError(null);
            const result = await CleaningManager.getAll(filters);
            if (result.success && result.data) {
                setCleanings(result.data.data);
                setMeta(result.data.meta);
            } else {
                setError(result.error || t('errors.generic'));
            }
            setIsLoading(false);
        },
        [t]
    );

    useEffect(() => {
        const filters: CleaningFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
            type: typeFilter || undefined,
        };
        fetchCleanings(filters);
    }, [currentPage, debouncedSearch, sortBy, sortDirection, typeFilter, fetchCleanings]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('desc');
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
        return sortDirection === 'asc' ? (
            <FaArrowUp className="ml-1 h-3 w-3 text-brand-500" />
        ) : (
            <FaArrowDown className="ml-1 h-3 w-3 text-brand-500" />
        );
    };

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
            refreshList();
        } else {
            deleteModal.closeModal();
            showError(result.error || t('errors.generic'));
        }
        setIsDeleting(false);
    };

    const handleModalSuccess = () => {
        refreshList();
    };

    const handleModalClose = () => {
        cleaningModal.closeModal();
        setPreselectedMaterialId(null);
    };

    const refreshList = () => {
        const filters: CleaningFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
            type: typeFilter || undefined,
        };
        fetchCleanings(filters);
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
        { ...createActions.edit(() => handleEdit(cleaning), t), hidden: !canUpdate },
        { ...createActions.delete(() => handleDeleteClick(cleaning), t), hidden: !canDelete },
    ];

    // Check if any action is available
    const hasAnyAction = canUpdate || canDelete;

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
                        {canCreate && (
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
                        <div className="relative max-w-md flex-1">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('cleanings.search')}
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
                                    {t('cleanings.material')}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort('type')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('cleanings.type')}
                                        {renderSortIcon('type')}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('cleanings.description')}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('cleanings.date')}
                                        {renderSortIcon('created_at')}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('cleanings.createdBy')}
                                </TableCell>
                                {hasAnyAction && (
                                    <TableCell isHeader className="w-20 px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t('common.actions')}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={hasAnyAction ? 6 : 5}>
                                        <div className="flex items-center justify-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : cleanings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={hasAnyAction ? 6 : 5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                                            <Link
                                                to={`/materials/${cleaning.material_id}`}
                                                className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                            >
                                                {cleaning.material?.name || cleaning.material_name}
                                            </Link>
                                        </TableCell>
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
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {cleaning.creator?.full_name || cleaning.created_by_name || '-'}
                                            </span>
                                        </TableCell>
                                        {hasAnyAction && (
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
