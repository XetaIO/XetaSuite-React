import { useState, useEffect, useCallback, type FC } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
    FaMagnifyingGlass,
    FaArrowUp,
    FaArrowDown,
    FaWrench,
    FaBell,
    FaEnvelope,
} from 'react-icons/fa6';
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from '@/shared/components/common';
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, ActionsDropdown, createMaterialActions } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { useModal } from '@/shared/hooks';
import { showSuccess, showError, formatDate } from '@/shared/utils';
import { useAuth } from '@/features/Auth';
import { MaterialManager } from '../services';
import { MaterialModal } from './MaterialModal';
import { MaterialQrCodeModal } from './MaterialQrCodeModal';
import type { Material, MaterialFilters } from '../types';
import type { PaginationMeta } from '@/shared/types';

type SortField = 'name' | 'created_at' | 'last_cleaning_at';
type SortDirection = 'asc' | 'desc';

const MaterialListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Selected material for edit/delete/qrcode
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions
    const canCreate = hasPermission('material.create');
    const canUpdate = hasPermission('material.update');
    const canDelete = hasPermission('material.delete');
    const canGenerateQrCode = hasPermission('material.generateQrCode');

    // Modals
    const materialModal = useModal();
    const deleteModal = useModal();
    const qrCodeModal = useModal();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchMaterials = useCallback(
        async (filters: MaterialFilters) => {
            setIsLoading(true);
            setError(null);
            const result = await MaterialManager.getAll(filters);
            if (result.success && result.data) {
                setMaterials(result.data.data);
                setMeta(result.data.meta);
            } else {
                setError(result.error || t('errors.generic'));
            }
            setIsLoading(false);
        },
        [t]
    );

    useEffect(() => {
        const filters: MaterialFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchMaterials(filters);
    }, [currentPage, debouncedSearch, sortBy, sortDirection, fetchMaterials]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('asc');
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
        setSelectedMaterial(null);
        materialModal.openModal();
    };

    const handleEdit = (material: Material) => {
        setSelectedMaterial(material);
        materialModal.openModal();
    };

    const handleDeleteClick = (material: Material) => {
        setSelectedMaterial(material);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMaterial) return;

        setIsDeleting(true);
        const result = await MaterialManager.delete(selectedMaterial.id);
        if (result.success) {
            showSuccess(t('materials.messages.deleted', { name: selectedMaterial.name }));
            deleteModal.closeModal();
            setSelectedMaterial(null);
            const filters: MaterialFilters = {
                page: currentPage,
                search: debouncedSearch || undefined,
                sort_by: sortBy,
                sort_direction: sortBy ? sortDirection : undefined,
            };
            fetchMaterials(filters);
        } else {
            deleteModal.closeModal();
            showError(result.error || t('errors.generic'));
        }
        setIsDeleting(false);
    };

    const handleQrCode = (material: Material) => {
        setSelectedMaterial(material);
        qrCodeModal.openModal();
    };

    const handleModalSuccess = () => {
        const filters: MaterialFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchMaterials(filters);
    };

    const getMaterialActions = (material: Material) => [
        { ...createMaterialActions.qrCode(() => handleQrCode(material), t), hidden: !canGenerateQrCode },
        { ...createMaterialActions.edit(() => handleEdit(material), t), hidden: !canUpdate },
        { ...createMaterialActions.delete(() => handleDeleteClick(material), t), hidden: !canDelete },
    ];

    // Check if any action is available
    const hasAnyAction = canUpdate || canDelete || canGenerateQrCode;

    return (
        <>
            <PageMeta title={`${t('materials.title')} | XetaSuite`} description={t('materials.description')} />
            <PageBreadcrumb pageTitle={t('materials.title')} breadcrumbs={[{ label: t('materials.title') }]} />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t('materials.listTitle')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('materials.manageMaterialsAndTheirInformation')}
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
                                {t('materials.create')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('common.name')}
                                        {renderSortIcon('name')}
                                    </button>
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t('materials.zone')}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t('materials.cleaningAlert')}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    <button
                                        onClick={() => handleSort('last_cleaning_at')}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t('materials.lastCleaning')}
                                        {renderSortIcon('last_cleaning_at')}
                                    </button>
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
                                {hasAnyAction && (
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
                                [...Array(6)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : materials.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        colSpan={6}
                                    >
                                        {debouncedSearch ? (
                                            <div>
                                                <p>{t('materials.noMaterialsFor', { search: debouncedSearch })}</p>
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t('common.clearSearch')}
                                                </button>
                                            </div>
                                        ) : (
                                            t('materials.noMaterials')
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                materials.map((material) => (
                                    <TableRow
                                        key={material.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaWrench className="h-4 w-4 text-gray-400" />
                                                <Link
                                                    to={`/materials/${material.id}`}
                                                    className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                                >
                                                    {material.name}
                                                </Link>
                                            </div>
                                            {material.description && (
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {material.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {material.zone?.name || '-'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {material.cleaning_alert ? (
                                                    <>
                                                        <Badge color="success" size="md" title={t('materials.cleaningAlertEnabled')}>
                                                            <FaBell />
                                                        </Badge>
                                                        {material.cleaning_alert_email && (
                                                            <Badge
                                                                color="brand"
                                                                size="md"
                                                                title={t('materials.emailNotificationEnabled')}
                                                            >
                                                                <FaEnvelope />
                                                            </Badge>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Badge color="light" size="md" title={t('materials.cleaningAlertDisabled')}>
                                                        <FaBell />
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {material.last_cleaning_at ? formatDate(material.last_cleaning_at) : '-'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(material.created_at)}
                                        </TableCell>
                                        {hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getMaterialActions(material)} />
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
            <MaterialModal
                isOpen={materialModal.isOpen}
                onClose={materialModal.closeModal}
                material={selectedMaterial}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t('materials.deleteTitle')}
                message={t('common.confirmDelete', { name: selectedMaterial?.name })}
            />

            {/* QR Code Modal */}
            <MaterialQrCodeModal
                isOpen={qrCodeModal.isOpen}
                onClose={qrCodeModal.closeModal}
                material={selectedMaterial}
            />
        </>
    );
};

export default MaterialListPage;
