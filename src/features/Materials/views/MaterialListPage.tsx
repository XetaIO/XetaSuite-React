import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
    FaWrench,
    FaBell,
    FaEnvelope,
} from 'react-icons/fa6';
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from '@/shared/components/common';
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, ActionsDropdown, createActions, LinkedName, SortableTableHeader, StaticTableHeader } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { SearchInput } from '@/shared/components/form';
import { useModal, useListPage, useEntityPermissions } from '@/shared/hooks';
import { showSuccess, showError, formatDate } from '@/shared/utils';
import { useAuth } from '@/features/Auth';
import { MaterialManager } from '../services';
import { MaterialModal } from './MaterialModal';
import { MaterialQrCodeModal } from './MaterialQrCodeModal';
import type { Material, MaterialFilters } from '../types';

const MaterialListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: materials,
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
    } = useListPage<Material, MaterialFilters>({
        fetchFn: MaterialManager.getAll,
    });

    // Selected material for edit/delete/qrcode
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions - not allowed on HQ (noLocationCheck: false is default, so they need to be on a regular site)
    const permissions = useEntityPermissions("material", { hasPermission, isOnHeadquarters });
    const canViewZone = hasPermission('zone.view');
    const canViewSite = hasPermission('site.view');

    // Modals
    const materialModal = useModal();
    const deleteModal = useModal();
    const qrCodeModal = useModal();

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
            refresh();
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
        refresh();
    };

    const getMaterialActions = (material: Material) => [
        { ...createActions.qrCode(() => handleQrCode(material), t), hidden: !permissions.canGenerateQrCode },
        { ...createActions.edit(() => handleEdit(material), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(material), t), hidden: !permissions.canDelete },
    ];

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
                        {permissions.canCreate && (
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
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t('common.searchPlaceholder')}
                        />
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
                                <SortableTableHeader
                                    field="name"
                                    label={t('common.name')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t('materials.zone')} />
                                {isOnHeadquarters && (
                                    <StaticTableHeader label={t('materials.site')} />
                                )}
                                <StaticTableHeader label={t('materials.cleaningAlert')} align="center" />
                                <SortableTableHeader
                                    field="last_cleaning_at"
                                    label={t('materials.lastCleaning')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
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
                                [...Array(8)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4">
                                                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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
                            ) : materials.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        colSpan={permissions.hasAnyAction ? 7 : isOnHeadquarters ? 7 : 6}
                                    >
                                        {debouncedSearch ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <FaWrench className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
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
                                                <LinkedName
                                                    canView={permissions.canView}
                                                    id={material.id}
                                                    name={material.name}
                                                    basePath="materials" />
                                            </div>
                                            {material.description && (
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {material.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewZone}
                                                id={material.zone?.id}
                                                name={material.zone?.name}
                                                basePath="zones" />
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                <LinkedName
                                                    canView={canViewSite}
                                                    id={material.site?.id}
                                                    name={material.site?.name}
                                                    basePath="sites" />
                                            </TableCell>
                                        )}
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
                                        {permissions.hasAnyAction && (
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
