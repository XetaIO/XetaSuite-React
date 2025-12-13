import { useState, useEffect, useCallback, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaMagnifyingGlass,
    FaArrowUp,
    FaArrowDown,
    FaArrowRightToBracket,
    FaArrowRightFromBracket,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, ActionsDropdown, createActions } from "@/shared/components/ui";
import { useModal } from "@/shared/hooks";
import { showSuccess, showError, formatCurrency } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { ItemMovementManager } from "../services";
import { ItemMovementModal } from "./ItemMovementModal";
import type { ItemMovement, ItemMovementFilters, MovementType } from "../types";
import type { PaginationMeta } from "@/shared/types";

type SortField = "movement_date" | "quantity" | "total_price" | "type" | "created_at";
type SortDirection = "asc" | "desc";

const ItemMovementListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();
    const [movements, setMovements] = useState<ItemMovement[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<MovementType | "">("");
    const [sortBy, setSortBy] = useState<SortField>("movement_date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    // Selected movement for operations
    const [selectedMovement, setSelectedMovement] = useState<ItemMovement | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions
    const canUpdate = hasPermission("item.update");

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchMovements = useCallback(async (filters: ItemMovementFilters) => {
        setIsLoading(true);
        setError(null);
        const result = await ItemMovementManager.getAll(filters);
        if (result.success && result.data) {
            setMovements(result.data.data);
            setMeta(result.data.meta);
        } else {
            setError(result.error || t("errors.generic"));
        }
        setIsLoading(false);
    }, [t]);

    useEffect(() => {
        const filters: ItemMovementFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            type: typeFilter || undefined,
            sort_by: sortBy,
            sort_direction: sortDirection,
        };
        fetchMovements(filters);
    }, [currentPage, debouncedSearch, typeFilter, sortBy, sortDirection, fetchMovements]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDirection("desc");
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

    const handleEdit = (movement: ItemMovement) => {
        setSelectedMovement(movement);
        editModal.openModal();
    };

    const handleDeleteClick = (movement: ItemMovement) => {
        setSelectedMovement(movement);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMovement) return;

        setIsDeleting(true);
        const result = await ItemMovementManager.delete(
            selectedMovement.item_id,
            selectedMovement.id
        );
        if (result.success) {
            showSuccess(t("itemMovements.messages.deleted"));
            deleteModal.closeModal();
            setSelectedMovement(null);
            refreshList();
        } else {
            deleteModal.closeModal();
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
    };

    const handleModalSuccess = () => {
        refreshList();
    };

    const refreshList = () => {
        const filters: ItemMovementFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            type: typeFilter || undefined,
            sort_by: sortBy,
            sort_direction: sortDirection,
        };
        fetchMovements(filters);
    };

    const getTypeFilterOptions = (): { value: MovementType | ""; label: string }[] => [
        { value: "", label: t("itemMovements.filters.allTypes") },
        { value: "entry", label: t("itemMovements.types.entry") },
        { value: "exit", label: t("itemMovements.types.exit") },
    ];

    const getTypeBadge = (type: MovementType) => {
        if (type === "entry") {
            return (
                <Badge color="success" size="sm">
                    <FaArrowRightToBracket className="mr-1.5 h-3 w-3" />
                    {t("itemMovements.types.entry")}
                </Badge>
            );
        }
        return (
            <Badge color="warning" size="sm">
                <FaArrowRightFromBracket className="mr-1.5 h-3 w-3" />
                {t("itemMovements.types.exit")}
            </Badge>
        );
    };

    const getMovementActions = (movement: ItemMovement) => [
        { ...createActions.edit(() => handleEdit(movement), t), hidden: !canUpdate },
        { ...createActions.delete(() => handleDeleteClick(movement), t), hidden: !canUpdate },
    ];

    const handleClearFilters = () => {
        setSearchQuery('');
        setTypeFilter('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || typeFilter;

    return (
        <>
            <PageMeta
                title={`${t("itemMovements.title")} | XetaSuite`}
                description={t("itemMovements.description")}
            />
            <PageBreadcrumb
                pageTitle={t("itemMovements.title")}
                breadcrumbs={[{ label: t("itemMovements.title") }]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("itemMovements.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("itemMovements.listDescription")}
                        </p>
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
                                placeholder={t("itemMovements.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                                    setTypeFilter(e.target.value as MovementType | "");
                                    setCurrentPage(1);
                                }}
                                title={t("itemMovements.filters.allTypes")}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                {getTypeFilterOptions().map((option) => (
                                    <option key={option.value} value={option.value} className="dark:bg-gray-900">
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
                                    <button
                                        onClick={() => handleSort("movement_date")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("itemMovements.fields.movementDate")}
                                        {renderSortIcon("movement_date")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("type")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("itemMovements.fields.type")}
                                        {renderSortIcon("type")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("itemMovements.fields.item")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("quantity")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("itemMovements.fields.quantity")}
                                        {renderSortIcon("quantity")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("total_price")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("itemMovements.fields.totalPrice")}
                                        {renderSortIcon("total_price")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("itemMovements.fields.supplier")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("itemMovements.fields.createdBy")}
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
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="ml-auto h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : movements.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        colSpan={8}
                                    >
                                        {debouncedSearch || typeFilter ? (
                                            <div>
                                                <p>{t("itemMovements.noResultsWithFilters")}</p>
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t("common.clearFilters")}
                                                </button>
                                            </div>
                                        ) : (
                                            t("itemMovements.noMovements")
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                movements.map((movement) => (
                                    <TableRow
                                        key={movement.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {ItemMovementManager.formatDate(movement.movement_date)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            {getTypeBadge(movement.type)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            {movement.item ? (
                                                <Link
                                                    to={`/items/${movement.item_id}`}
                                                    className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                                >
                                                    {movement.item.name}
                                                    {movement.item.reference && (
                                                        <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            ({movement.item.reference})
                                                        </span>
                                                    )}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {movement.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatCurrency(movement.total_price)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {movement.supplier?.name || "—"}
                                            {movement.supplier_invoice_number && (
                                                <span className="ml-1.5 text-xs">
                                                    ({movement.supplier_invoice_number})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {movement.created_by_name}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <ActionsDropdown actions={getMovementActions(movement)} />
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

            {/* Edit Modal */}
            {selectedMovement && (
                <ItemMovementModal
                    isOpen={editModal.isOpen}
                    onClose={() => {
                        editModal.closeModal();
                        setSelectedMovement(null);
                    }}
                    movement={selectedMovement}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => {
                    deleteModal.closeModal();
                    setSelectedMovement(null);
                }}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("itemMovements.deleteConfirm.title")}
                message={t("itemMovements.deleteConfirm.message")}
            />
        </>
    );
};

export default ItemMovementListPage;
