import { useState, useEffect, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaPlus, FaMagnifyingGlass, FaFileExport, FaBuilding } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, createActions, ActionsDropdown } from "@/shared/components/ui";
import { Button } from "@/shared/components/ui";
import { Checkbox } from "@/shared/components/form";
import { useModal, useListPage, useEntityPermissions } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { SiteManager } from "../services";
import { SiteModal } from "./SiteModal";
import type { Site, SiteFilters } from "../types";

type SortField = "name" | "zone_count" | "created_at";

const SiteListPage: FC = () => {
    const { t } = useTranslation();

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
    const permissions = useEntityPermissions("site", { hqOnly: true });

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

    return (
        <>
            <PageMeta title={`${t("sites.title")} | XetaSuite`} description={t("sites.description")} />
            <PageBreadcrumb
                pageTitle={t("sites.title")}
                breadcrumbs={[{ label: t("sites.title") }]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("sites.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("sites.manageSitesAndTheirInformation")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("common.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    title={t("common.clearSearch")}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {permissions.canExport && selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{t("sites.export.selected", { count: selectedIds.size })}</span>
                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    className="text-brand-500 hover:text-brand-600"
                                >
                                    {t("sites.export.clearSelection")}
                                </button>
                            </div>
                        )}
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
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("name")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("common.name")}
                                        {renderSortIcon("name")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("sites.detail.managers")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("zone_count")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("sites.zones")}
                                        {renderSortIcon("zone_count")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("common.collaborators")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("created_at")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("common.createdAt")}
                                        {renderSortIcon("created_at")}
                                    </button>
                                </TableCell>
                                {permissions.hasAnyAction && (
                                    <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t("common.actions")}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(8)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        {permissions.canExport && (
                                            <TableCell className="px-6 py-4">
                                                <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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
                            ) : sites.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={permissions.canExport ? 7 : 6}>
                                        <div className="flex flex-col items-center justify-center">
                                            <FaBuilding className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            {debouncedSearch ? (
                                                <div>
                                                    <p>{t("sites.noSitesFor", { search: debouncedSearch })}</p>
                                                    <button
                                                        onClick={() => setSearchQuery("")}
                                                        className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                    >
                                                        {t("common.clearSearch")}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p>{t("sites.noSites")}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sites.map((site) => (
                                    <TableRow
                                        key={site.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${selectedIds.has(site.id) ? "bg-brand-50/50 dark:bg-brand-500/5" : ""
                                            }`}
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
            </div>

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
