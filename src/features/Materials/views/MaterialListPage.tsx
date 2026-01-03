import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FaPlus,
    FaWrench,
    FaBell,
    FaEnvelope,
} from 'react-icons/fa6';
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from '@/shared/components/common';
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, ActionsDropdown, createActions, LinkedName, SortableTableHeader, StaticTableHeader, Button, ListPageCard, ListPageHeader, SearchSection, ErrorAlert, TableSkeletonRows, EmptyTableRow } from '@/shared/components/ui';
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
            setSelectedMaterial(null);
            refresh();
        } else {
            showError(result.error || t('errors.generic'));
        }
        setIsDeleting(false);
        deleteModal.closeModal();
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

    const skeletonCells = [
        { width: 'w-32' },
        { width: 'w-24' },
        ...(isOnHeadquarters ? [{ width: 'w-24' }] : []),
        { width: 'w-16', align: 'center' as const },
        { width: 'w-24' },
        { width: 'w-24' },
        ...(permissions.hasAnyAction ? [{ width: 'w-16', align: 'right' as const }] : []),
    ];
    const colSpan = 6 + (isOnHeadquarters ? 1 : 0) + (permissions.hasAnyAction ? 1 : 0);

    return (
        <>
            <PageMeta title={`${t('materials.title')} | XetaSuite`} description={t('materials.description')} />
            <PageBreadcrumb pageTitle={t('materials.title')} breadcrumbs={[{ label: t('materials.title') }]} />

            <ListPageCard>
                <ListPageHeader
                    title={t('materials.listTitle')}
                    description={t('materials.manageMaterialsAndTheirInformation')}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t('materials.create')}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

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
                                <TableSkeletonRows count={6} cells={skeletonCells} />
                            ) : materials.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch}
                                    onClearSearch={() => setSearchQuery('')}
                                    emptyMessage={t('materials.noMaterials')}
                                />
                            ) : (
                                materials.map((material) => (
                                    <TableRow
                                        key={material.id}
                                        className="table-row-hover"
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
            </ListPageCard>

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
