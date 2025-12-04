import { useState, useEffect, useCallback, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaPlus,
    FaPenToSquare,
    FaTrash,
    FaMagnifyingGlass,
    FaArrowUp,
    FaArrowDown,
    FaQrcode,
    FaArrowRightToBracket,
    FaArrowRightFromBracket,
    FaBoxesStacked,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Button, Badge } from "@/shared/components/ui";
import { useModal } from "@/shared/hooks";
import { showSuccess, showError } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { ItemManager } from "../services";
import { ItemModal } from "./ItemModal";
import { ItemQrCodeModal } from "./ItemQrCodeModal";
import { ItemMovementModal } from "./ItemMovementModal";
import type { Item, ItemFilters, StockStatus } from "../types";
import type { PaginationMeta } from "@/shared/types";

type SortField = "name" | "reference" | "current_stock" | "purchase_price" | "created_at";
type SortDirection = "asc" | "desc";

const ItemListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [stockStatusFilter, setStockStatusFilter] = useState<StockStatus | "">("");
    const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Selected item for operations
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions
    const canCreate = hasPermission("item.create");
    const canUpdate = hasPermission("item.update");
    const canDelete = hasPermission("item.delete");
    const canView = hasPermission("item.view");
    const canCreateMovement = hasPermission("item.createMovement");

    // Modals
    const itemModal = useModal();
    const deleteModal = useModal();
    const qrCodeModal = useModal();
    const movementModal = useModal();
    const [movementType, setMovementType] = useState<"entry" | "exit">("entry");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchItems = useCallback(async (filters: ItemFilters) => {
        setIsLoading(true);
        setError(null);
        const result = await ItemManager.getAll(filters);
        if (result.success && result.data) {
            setItems(result.data.data);
            setMeta(result.data.meta);
        } else {
            setError(result.error || t("errors.generic"));
        }
        setIsLoading(false);
    }, [t]);

    useEffect(() => {
        const filters: ItemFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            stock_status: stockStatusFilter || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchItems(filters);
    }, [currentPage, debouncedSearch, stockStatusFilter, sortBy, sortDirection, fetchItems]);

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
        setSelectedItem(null);
        itemModal.openModal();
    };

    const handleEdit = (item: Item) => {
        setSelectedItem(item);
        itemModal.openModal();
    };

    const handleDeleteClick = (item: Item) => {
        setSelectedItem(item);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return;

        setIsDeleting(true);
        const result = await ItemManager.delete(selectedItem.id);
        if (result.success) {
            showSuccess(t("items.messages.deleted", { name: selectedItem.name }));
            deleteModal.closeModal();
            setSelectedItem(null);
            refreshList();
        } else {
            deleteModal.closeModal();
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
    };

    const handleQrCode = (item: Item) => {
        setSelectedItem(item);
        qrCodeModal.openModal();
    };

    const handleMovement = (item: Item, type: "entry" | "exit") => {
        setSelectedItem(item);
        setMovementType(type);
        movementModal.openModal();
    };

    const handleModalSuccess = () => {
        refreshList();
    };

    const refreshList = () => {
        const filters: ItemFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            stock_status: stockStatusFilter || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchItems(filters);
    };

    const getStockStatusOptions = (): { value: StockStatus | ""; label: string }[] => [
        { value: "", label: t("items.filters.allStatuses") },
        { value: "ok", label: t("items.stockStatus.ok") },
        { value: "warning", label: t("items.stockStatus.warning") },
        { value: "critical", label: t("items.stockStatus.critical") },
        { value: "empty", label: t("items.stockStatus.empty") },
    ];

    return (
        <>
            <PageMeta title={`${t("items.title")} | XetaSuite`} description={t("items.description")} />
            <PageBreadcrumb
                pageTitle={t("items.title")}
                breadcrumbs={[{ label: t("items.title") }]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("items.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("items.manageItemsAndStock")}
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
                                {t("items.create")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className="relative max-w-md flex-1">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("items.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    title={t("common.clearSearch")}
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

                        {/* Stock Status Filter */}
                        <select
                            value={stockStatusFilter}
                            onChange={(e) => {
                                setStockStatusFilter(e.target.value as StockStatus | "");
                                setCurrentPage(1);
                            }}
                            title={t("items.filters.stockStatus")}
                            className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
                        >
                            {getStockStatusOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
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
                                    <button
                                        onClick={() => handleSort("name")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("items.fields.name")}
                                        {renderSortIcon("name")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("reference")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("items.fields.reference")}
                                        {renderSortIcon("reference")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("current_stock")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("items.fields.stock")}
                                        {renderSortIcon("current_stock")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.fields.status")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("purchase_price")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("items.fields.price")}
                                        {renderSortIcon("purchase_price")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.fields.supplier")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("common.actions")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Skeleton loading
                                [...Array(6)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        colSpan={7}
                                    >
                                        {debouncedSearch || stockStatusFilter ? (
                                            <div>
                                                <p>{t("items.noItemsFor")}</p>
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setStockStatusFilter("");
                                                    }}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t("common.clearFilters")}
                                                </button>
                                            </div>
                                        ) : (
                                            t("items.noItems")
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaBoxesStacked className="h-4 w-4 text-gray-400" />
                                                {canView ? (
                                                    <Link
                                                        to={`/items/${item.id}`}
                                                        className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {item.name}
                                                    </span>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {item.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <span className="font-mono text-sm">
                                                {item.reference || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {item.current_stock}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge color={ItemManager.getStockStatusBadgeColor(item.stock_status_color)} size="sm">
                                                {t(ItemManager.getStockStatusLabelKey(item.stock_status))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {ItemManager.formatCurrency(item.purchase_price, item.currency)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {item.supplier?.name || "—"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleQrCode(item)}
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                                                    title={t("items.qrCode.title")}
                                                >
                                                    <FaQrcode className="h-4 w-4" />
                                                </button>
                                                {canCreateMovement && (
                                                    <>
                                                        <button
                                                            onClick={() => handleMovement(item, "entry")}
                                                            className="rounded-lg p-2 text-success-500 hover:bg-success-50 dark:hover:bg-success-500/10"
                                                            title={t("items.movements.addEntry")}
                                                        >
                                                            <FaArrowRightToBracket className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMovement(item, "exit")}
                                                            className="rounded-lg p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                                                            title={t("items.movements.addExit")}
                                                        >
                                                            <FaArrowRightFromBracket className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {canUpdate && (
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                                                        title={t("common.edit")}
                                                    >
                                                        <FaPenToSquare className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-error-400"
                                                        title={t("common.delete")}
                                                    >
                                                        <FaTrash className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
            </div>

            {/* Modals */}
            <ItemModal
                isOpen={itemModal.isOpen}
                onClose={itemModal.closeModal}
                item={selectedItem}
                onSuccess={handleModalSuccess}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("items.delete.title")}
                message={t("items.delete.message", { name: selectedItem?.name })}
            />

            <ItemQrCodeModal
                isOpen={qrCodeModal.isOpen}
                onClose={qrCodeModal.closeModal}
                item={selectedItem}
            />

            <ItemMovementModal
                isOpen={movementModal.isOpen}
                onClose={movementModal.closeModal}
                item={selectedItem}
                type={movementType}
                onSuccess={handleModalSuccess}
            />
        </>
    );
};

export default ItemListPage;
