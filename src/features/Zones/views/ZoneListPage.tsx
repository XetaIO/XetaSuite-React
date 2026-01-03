import { useState, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaPlus, FaLayerGroup, FaWrench } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, ActionsDropdown, createActions, SortableTableHeader, StaticTableHeader, Button, ListPageCard, ListPageHeader, SearchSection, ErrorAlert, TableSkeletonRows, EmptyTableRow } from "@/shared/components/ui";
import { useModal, useListPage, useEntityPermissions } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { ZoneManager } from "../services";
import { ZoneModal } from "./ZoneModal";
import type { Zone, ZoneFilters } from "../types";

const ZoneListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: zones,
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
    } = useListPage<Zone, ZoneFilters>({
        fetchFn: ZoneManager.getAll,
    });

    // Selected zone for edit/delete
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions - zones are not HQ resources (managed on regular sites)
    const permissions = useEntityPermissions("zone", { hasPermission, isOnHeadquarters });

    // Modals
    const zoneModal = useModal();
    const deleteModal = useModal();

    const handleCreate = () => {
        setSelectedZone(null);
        zoneModal.openModal();
    };

    const handleEdit = (zone: Zone) => {
        setSelectedZone(zone);
        zoneModal.openModal();
    };

    const handleDeleteClick = (zone: Zone) => {
        setSelectedZone(zone);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedZone) return;

        setIsDeleting(true);
        const result = await ZoneManager.delete(selectedZone.id);
        if (result.success) {
            showSuccess(t("zones.messages.deleted", { name: selectedZone.name }));
            setSelectedZone(null);
            refresh();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
        deleteModal.closeModal();
    };

    const handleModalSuccess = () => {
        refresh();
    };

    const getZoneActions = (zone: Zone) => [
        { ...createActions.edit(() => handleEdit(zone), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(zone), t), hidden: !permissions.canDelete },
    ];

    const skeletonCells = [
        { width: "w-32" },
        { width: "w-24" },
        { width: "w-24" },
        { width: "w-8", center: true },
        { width: "w-8", center: true },
        { width: "w-24" },
        ...(permissions.hasAnyAction ? [{ width: "w-16", align: "right" as const }] : []),
    ];
    const colSpan = 6 + (permissions.hasAnyAction ? 1 : 0);

    return (
        <>
            <PageMeta title={`${t("zones.title")} | XetaSuite`} description={t("zones.description")} />
            <PageBreadcrumb
                pageTitle={t("zones.title")}
                breadcrumbs={[{ label: t("zones.title") }]}
            />

            <ListPageCard>
                <ListPageHeader
                    title={t("zones.listTitle")}
                    description={t("zones.manageZonesAndTheirInformation")}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t("zones.create")}
                            </Button>
                        )
                    }
                />

                <SearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                <SortableTableHeader
                                    field="name"
                                    label={t("common.name")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t("zones.site")} />
                                <StaticTableHeader label={t("zones.parent")} />
                                <SortableTableHeader
                                    field="children_count"
                                    label={t("zones.subZones")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="material_count"
                                    label={t("zones.materials")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="created_at"
                                    label={t("common.createdAt")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                {permissions.hasAnyAction && (
                                    <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t("common.actions")}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows count={6} cells={skeletonCells} />
                            ) : zones.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch}
                                    onClearSearch={() => setSearchQuery("")}
                                    emptyMessage={t("zones.noZones")}
                                />
                            ) : (
                                zones.map((zone) => (
                                    <TableRow key={zone.id} className="table-row-hover">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {permissions.canView ? (
                                                    <Link
                                                        to={`/zones/${zone.id}`}
                                                        className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                                    >
                                                        {zone.name}
                                                    </Link>
                                                ) : (
                                                    zone.name
                                                )}
                                                {zone.allow_material && (
                                                    <Badge
                                                        extraClass="py-1.5"
                                                        color="success"
                                                        title={t("zones.allowsMaterials")}
                                                    >
                                                        <FaWrench className="h-3 w-3" />
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {zone.site?.name || "-"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {zone.parent?.name || "-"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color="brand">
                                                <FaLayerGroup className="h-3 w-3" />
                                                {zone.children_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color="brand">
                                                <FaWrench className="h-3 w-3" />
                                                {zone.material_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(zone.created_at)}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getZoneActions(zone)} />
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
            <ZoneModal
                isOpen={zoneModal.isOpen}
                onClose={zoneModal.closeModal}
                zone={selectedZone}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("zones.deleteTitle")}
                message={t("common.confirmDelete", { name: selectedZone?.name })}
            />
        </>
    );
};

export default ZoneListPage;
