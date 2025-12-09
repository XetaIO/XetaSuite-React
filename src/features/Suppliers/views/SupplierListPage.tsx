import { useState, useEffect, useCallback, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPenToSquare, FaTrash, FaMagnifyingGlass, FaArrowUp, FaArrowDown, FaFileExport } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/shared/components/ui";
import { Button } from "@/shared/components/ui";
import { Checkbox } from "@/shared/components/form";
import { useModal } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { SupplierManager } from "../services";
import { SupplierModal } from "./SupplierModal";
import type { Supplier, SupplierFilters } from "../types";
import type { PaginationMeta } from "@/shared/types";

type SortField = "name" | "item_count" | "created_at";
type SortDirection = "asc" | "desc";

const SupplierListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Selected supplier for edit/delete
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Selection for export
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isExporting, setIsExporting] = useState(false);

    // Permissions
    const canCreate = hasPermission("supplier.create");
    const canUpdate = hasPermission("supplier.update");
    const canDelete = hasPermission("supplier.delete");
    const canExport = hasPermission("supplier.export");

    // Modals
    const supplierModal = useModal();
    const deleteModal = useModal();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchSuppliers = useCallback(async (filters: SupplierFilters) => {
        setIsLoading(true);
        setError(null);
        const result = await SupplierManager.getAll(filters);
        if (result.success && result.data) {
            setSuppliers(result.data.data);
            setMeta(result.data.meta);
        } else {
            setError(result.error || t("errors.generic"));
        }
        setIsLoading(false);
    }, [t]);

    useEffect(() => {
        const filters: SupplierFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchSuppliers(filters);
    }, [currentPage, debouncedSearch, sortBy, sortDirection, fetchSuppliers]);

    // Clear selection only when search changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [debouncedSearch]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDirection("asc");
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
        return sortDirection === "asc" ? (
            <FaArrowUp className="ml-1 h-3 w-3 text-brand-500" />
        ) : (
            <FaArrowDown className="ml-1 h-3 w-3 text-brand-500" />
        );
    };

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
            const filters: SupplierFilters = {
                page: currentPage,
                search: debouncedSearch || undefined,
                sort_by: sortBy,
                sort_direction: sortBy ? sortDirection : undefined,
            };
            fetchSuppliers(filters);
        } else {
            deleteModal.closeModal();
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
    };

    const handleModalSuccess = () => {
        const filters: SupplierFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchSuppliers(filters);
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
                        {canExport && selectedIds.size > 0 && (
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
                        {canCreate && (
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
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("common.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                        {canExport && selectedIds.size > 0 && (
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
                    <div className="mx-6 mt-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-800">
                                {canExport && (
                                    <TableCell isHeader className="w-12 px-6 py-3">
                                        <Checkbox
                                            checked={isAllCurrentPageSelected}
                                            indeterminate={isSomeCurrentPageSelected}
                                            onChange={handleSelectAll}
                                            title={isAllCurrentPageSelected ? t("suppliers.export.deselectAll") : t("suppliers.export.selectAll")}
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
                                    {t("common.description")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("item_count")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("suppliers.items")}
                                        {renderSortIcon("item_count")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("common.creator")}
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
                                {(canUpdate || canDelete) && (
                                    <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t("common.actions")}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(6)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        {canExport && (
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
                                        {(canUpdate || canDelete) && (
                                            <TableCell className="px-6 py-4">
                                                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : suppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={canExport ? 7 : 6}>
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
                                        {canExport && (
                                            <TableCell className="px-6 py-4">
                                                <Checkbox checked={selectedIds.has(supplier.id)} onChange={() => handleSelectOne(supplier.id)} />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4">
                                            <Link
                                                to={`/suppliers/${supplier.id}`}
                                                className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                            >
                                                {supplier.name}
                                            </Link>
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
                                            {supplier.creator?.full_name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(supplier.created_at)}
                                        </TableCell>
                                        {(canUpdate || canDelete) && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canUpdate && (
                                                        <button
                                                            onClick={() => handleEdit(supplier)}
                                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                                                            title={t("common.edit")}
                                                        >
                                                            <FaPenToSquare className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDeleteClick(supplier)}
                                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-error-400"
                                                            title={t("common.delete")}
                                                        >
                                                            <FaTrash className="h-4 w-4" />
                                                        </button>
                                                    )}
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
