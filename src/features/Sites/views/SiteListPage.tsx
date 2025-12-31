import { useState, useEffect, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaPlus, FaFileExport } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, createActions, ActionsDropdown, SortableTableHeader, StaticTableHeader, Button, ListPageCard, ListPageHeader, SearchSection, ErrorAlert, TableSkeletonRows, EmptyTableRow } from "@/shared/components/ui";
import { Checkbox } from "@/shared/components/form";
import { useModal, useListPage, useEntityPermissions } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { SiteManager } from "../services";
import { SiteModal } from "./SiteModal";
import type { Site, SiteFilters } from "../types";

const SiteListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: sites,
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
    } = useListPage<Site, SiteFilters>({
        fetchFn: SiteManager.getAll,
        defaultSortField: undefined,
        defaultSortDirection: "asc",
    });

    // Selected site for edit/delete
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Selection for export
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isExporting, setIsExporting] = useState(false);

    // Permissions - site is HQ-only
    const permissions = useEntityPermissions("site", { hasPermission, isOnHeadquarters }, { hqOnly: true });

    // Modals
    const siteModal = useModal();
    const deleteModal = useModal();

    // Clear selection only when search changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [debouncedSearch]);

    const handleCreate = () => {
        setSelectedSite(null);
        siteModal.openModal();
    };

    const handleEdit = (site: Site) => {
        setSelectedSite(site);
        siteModal.openModal();
    };

    const handleDeleteClick = (site: Site) => {
        setSelectedSite(site);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedSite) return;

        setIsDeleting(true);
        const result = await SiteManager.delete(selectedSite.id);
        if (result.success) {
            showSuccess(t("sites.messages.deleted", { name: selectedSite.name }));
            deleteModal.closeModal();
            setSelectedSite(null);
            refresh();
        } else {
            deleteModal.closeModal();
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
    };

    const handleModalSuccess = () => {
        refresh();
    };

    // Selection handlers
    const handleSelectAll = () => {
        const newSelected = new Set(selectedIds);
        if (isAllCurrentPageSelected) {
            currentPageIds.forEach((id) => newSelected.delete(id));
        } else {
            currentPageIds.forEach((id) => newSelected.add(id));
        }
        setSelectedIds(newSelected);
    };

    const handleSelectOne = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const currentPageIds = sites.map((s) => s.id);
    const isAllCurrentPageSelected = sites.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
    const isSomeCurrentPageSelected = currentPageIds.some((id) => selectedIds.has(id)) && !isAllCurrentPageSelected;

    // Export handler
    const handleExport = async () => {
        if (selectedIds.size === 0) return;

        setIsExporting(true);
        try {
            // TODO: Implement export API call
            alert(t("sites.export.comingSoon"));
        } finally {
            setIsExporting(false);
        }
    };

    const getSiteActions = (site: Site) => [
        { ...createActions.edit(() => handleEdit(site), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(site), t), hidden: !permissions.canDelete },
    ];

    const skeletonCells = [
        ...(permissions.canExport ? [{ width: "w-4" }] : []),
        { width: "w-32" },
        { width: "w-48" },
        { width: "w-8", center: true },
        { width: "w-28" },
        { width: "w-24" },
        ...(permissions.hasAnyAction ? [{ width: "w-16", align: "right" as const }] : []),
    ];
    const colSpan = 6 + (permissions.canExport ? 1 : 0) + (permissions.hasAnyAction ? 1 : 0);

    return (
        <>
            <PageMeta title={`${t("sites.title")} | XetaSuite`} description={t("sites.description")} />
            <PageBreadcrumb
                pageTitle={t("sites.title")}
                breadcrumbs={[{ label: t("sites.title") }]}
            />

            <ListPageCard>
                <ListPageHeader
                    title={t("sites.listTitle")}
                    description={t("sites.manageSitesAndTheirInformation")}
                    actions={
                        <>
                            {permissions.canExport && selectedIds.size > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    startIcon={<FaFileExport className="h-4 w-4" />}
                                    onClick={handleExport}
                                    disabled={isExporting}
                                >
                                    {isExporting
                                        ? t("sites.export.exporting")
                                        : t("sites.export.button", { count: selectedIds.size })}
                                </Button>
                            )}
                            {permissions.canCreate && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    startIcon={<FaPlus className="h-4 w-4" />}
                                    onClick={handleCreate}
                                >
                                    {t("sites.create")}
                                </Button>
                            )}
                        </>
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    rightContent={
                        permissions.canExport && selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{t("sites.export.selected", { count: selectedIds.size })}</span>
                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    className="text-brand-500 hover:text-brand-600"
                                >
                                    {t("sites.export.clearSelection")}
                                </button>
                            </div>
                        )
                    }
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                {permissions.canExport && (
                                    <TableCell isHeader className="w-12 px-6 py-3">
                                        <Checkbox
                                            checked={isAllCurrentPageSelected}
                                            indeterminate={isSomeCurrentPageSelected}
                                            onChange={handleSelectAll}
                                            title={isAllCurrentPageSelected ? t("sites.export.deselectAll") : t("sites.export.selectAll")}
                                        />
                                    </TableCell>
                                )}
                                <SortableTableHeader
                                    field="name"
                                    label={t("common.name")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t("sites.detail.managers")} />
                                <SortableTableHeader
                                    field="zone_count"
                                    label={t("sites.zones")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <StaticTableHeader label={t("common.collaborators")} />
                                <SortableTableHeader
                                    field="created_at"
                                    label={t("common.createdAt")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                {permissions.hasAnyAction && (
                                    <StaticTableHeader label={t("common.actions")} align="right" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows count={8} cells={skeletonCells} />
                            ) : sites.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch}
                                    onClearSearch={() => setSearchQuery("")}
                                    emptyMessage={t("sites.noSites")}
                                />
                            ) : (
                                sites.map((site) => (
                                    <TableRow
                                        key={site.id}
                                        className={`table-row-hover ${selectedIds.has(site.id) ? "bg-brand-50/50 dark:bg-brand-500/5" : ""}`}
                                    >
                                        {permissions.canExport && (
                                            <TableCell className="px-6 py-4">
                                                <Checkbox checked={selectedIds.has(site.id)} onChange={() => handleSelectOne(site.id)} />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4">
                                            <Link
                                                to={`/sites/${site.id}`}
                                                className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                            >
                                                <span className="mr-2">
                                                    {site.name}
                                                </span>
                                                {site.is_headquarters && (
                                                    <Badge color="brand" size="sm">
                                                        {t("sites.detail.headquarters")}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {site.managers && site.managers.length > 0
                                                ? site.managers.map((manager) => manager.full_name).join(", ")
                                                : t("sites.detail.noManagers")}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                                {site.zone_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                                {site.user_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(site.created_at)}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getSiteActions(site)} />
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
                    <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                        <Pagination meta={meta} onPageChange={handlePageChange} />
                    </div>
                )}
            </ListPageCard>

            {/* Create/Edit Modal */}
            <SiteModal
                isOpen={siteModal.isOpen}
                onClose={siteModal.closeModal}
                site={selectedSite}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("sites.deleteTitle")}
                message={t("common.confirmDelete", { name: selectedSite?.name })}
            />
        </>
    );
};

export default SiteListPage;
