import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaFileExport } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, LinkedName, createActions, ActionsDropdown, SortableTableHeader, StaticTableHeader } from "@/shared/components/ui";
import { Button } from "@/shared/components/ui";
import { Checkbox, SearchInput } from "@/shared/components/form";
import { useModal, useListPage, useEntityPermissions } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { SupplierManager } from "../services";
import { SupplierModal } from "./SupplierModal";
import type { Supplier, SupplierFilters } from "../types";

const SupplierListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: suppliers,
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
    } = useListPage<Supplier, SupplierFilters>({
        fetchFn: SupplierManager.getAll,
    });

    // Selected supplier for edit/delete
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Selection for export
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isExporting, setIsExporting] = useState(false);

    // Permissions - HQ only for suppliers
    const permissions = useEntityPermissions("supplier", { hasPermission, isOnHeadquarters }, { hqOnly: true });
    const canViewCreator = isOnHeadquarters && hasPermission("user.view");

    // Modals
    const supplierModal = useModal();
    const deleteModal = useModal();

    const handleCreate = () => {
        setSelectedSupplier(null);
        supplierModal.openModal();
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        supplierModal.openModal();
    };

    const handleDeleteClick = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedSupplier) return;

        setIsDeleting(true);
        const result = await SupplierManager.delete(selectedSupplier.id);
        if (result.success) {
            showSuccess(t("suppliers.messages.deleted", { name: selectedSupplier.name }));
            deleteModal.closeModal();
            setSelectedSupplier(null);
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

    const currentPageIds = suppliers.map((s) => s.id);
    const isAllCurrentPageSelected = suppliers.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
    const isSomeCurrentPageSelected = currentPageIds.some((id) => selectedIds.has(id)) && !isAllCurrentPageSelected;

    // Export handler
    const handleExport = async () => {
        if (selectedIds.size === 0) return;

        setIsExporting(true);
        try {
            // TODO: Implement export API call
            alert(t("suppliers.export.comingSoon"));
        } finally {
            setIsExporting(false);
        }
    };

    const getSupplierActions = (supplier: Supplier) => [
        { ...createActions.edit(() => handleEdit(supplier), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(supplier), t), hidden: !permissions.canDelete },
    ];

    return (
        <>
            <PageMeta title={`${t("suppliers.title")} | XetaSuite`} description={t("suppliers.description")} />
            <PageBreadcrumb
                pageTitle={t("suppliers.title")}
                breadcrumbs={[{ label: t("suppliers.title") }]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("suppliers.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("suppliers.manageSuppliersAndTheirInformation")}
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
                                    ? t("suppliers.export.exporting")
                                    : t("suppliers.export.button", { count: selectedIds.size })}
                            </Button>
                        )}
                        {permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t("suppliers.create")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card-body-border">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            className="max-w-md flex-1"
                        />
                        {permissions.canExport && selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{t("suppliers.export.selected", { count: selectedIds.size })}</span>
                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    className="text-brand-500 hover:text-brand-600"
                                >
                                    {t("suppliers.export.clearSelection")}
                                </button>
                            </div>
                        )}
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
                                {permissions.canExport && (
                                    <TableCell isHeader className="w-12 px-6 py-3">
                                        <Checkbox
                                            checked={isAllCurrentPageSelected}
                                            indeterminate={isSomeCurrentPageSelected}
                                            onChange={handleSelectAll}
                                            title={isAllCurrentPageSelected ? t("suppliers.export.deselectAll") : t("suppliers.export.selectAll")}
                                        />
                                    </TableCell>
                                )}
                                <SortableTableHeader
                                    field="name"
                                    label={t("common.name")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t("common.description")} />
                                <SortableTableHeader
                                    field="item_count"
                                    label={t("suppliers.items")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <StaticTableHeader label={t("common.creator")} />
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
                                [...Array(6)].map((_, index) => (
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
                            ) : suppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={permissions.canExport ? 7 : 6}>
                                        {debouncedSearch ? (
                                            <div>
                                                <p>{t("suppliers.noSuppliersFor", { search: debouncedSearch })}</p>
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t("common.clearSearch")}
                                                </button>
                                            </div>
                                        ) : (
                                            t("suppliers.noSuppliers")
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.map((supplier) => (
                                    <TableRow
                                        key={supplier.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${selectedIds.has(supplier.id) ? "bg-brand-50/50 dark:bg-brand-500/5" : ""
                                            }`}
                                    >
                                        {permissions.canExport && (
                                            <TableCell className="px-6 py-4">
                                                <Checkbox checked={selectedIds.has(supplier.id)} onChange={() => handleSelectOne(supplier.id)} />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4">
                                            <LinkedName
                                                canView={permissions.canView}
                                                id={supplier.id}
                                                name={supplier.name}
                                                basePath="suppliers" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {supplier.description ? (
                                                <span className="line-clamp-1">{supplier.description}</span>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                                {supplier.item_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewCreator}
                                                id={supplier.creator?.id}
                                                name={supplier.creator?.full_name}
                                                basePath="users" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(supplier.created_at)}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getSupplierActions(supplier)} />
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
            <SupplierModal
                isOpen={supplierModal.isOpen}
                onClose={supplierModal.closeModal}
                supplier={selectedSupplier}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("suppliers.deleteTitle")}
                message={t("common.confirmDelete", { name: selectedSupplier?.name })}
            />
        </>
    );
};

export default SupplierListPage;
