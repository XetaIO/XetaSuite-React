import { useState, useEffect, useCallback, type FC } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaMagnifyingGlass, FaCubes, FaCalendar, FaUser } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/shared/components/ui";
import { NotFoundContent } from "@/shared/components/errors";
import { SupplierManager } from "../services";
import type { Supplier } from "../types";
import type { Item, ItemFilters } from "../types/item";
import type { PaginationMeta } from "@/shared/types";

type SortField = "name" | "reference" | "current_stock" | "purchase_price";
type SortDirection = "asc" | "desc";

const SupplierDetailPage: FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const supplierId = Number(id);

    // Supplier state
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [isLoadingSupplier, setIsLoadingSupplier] = useState(true);
    const [supplierError, setSupplierError] = useState<string | null>(null);

    // Items state
    const [items, setItems] = useState<Item[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoadingItems, setIsLoadingItems] = useState(true);
    const [itemsError, setItemsError] = useState<string | null>(null);

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Fetch supplier details
    useEffect(() => {
        const fetchSupplier = async () => {
            if (!supplierId) return;

            setIsLoadingSupplier(true);
            setSupplierError(null);
            const result = await SupplierManager.getById(supplierId);
            if (result.success && result.data) {
                setSupplier(result.data.data);
            } else {
                setSupplierError(result.error || t("errors.generic"));
            }
            setIsLoadingSupplier(false);
        };

        fetchSupplier();
    }, [supplierId, t]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch items
    const fetchItems = useCallback(
        async (filters: ItemFilters) => {
            if (!supplierId) return;

            setIsLoadingItems(true);
            setItemsError(null);
            const result = await SupplierManager.getItems(supplierId, filters);
            if (result.success && result.data) {
                setItems(result.data.data);
                setMeta(result.data.meta);
            } else {
                setItemsError(result.error || t("errors.generic"));
            }
            setIsLoadingItems(false);
        },
        [supplierId, t]
    );

    useEffect(() => {
        const filters: ItemFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortBy ? sortDirection : undefined,
        };
        fetchItems(filters);
    }, [currentPage, debouncedSearch, sortBy, sortDirection, fetchItems]);

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

    const getStockStatusBadge = (status: string, color: string) => {
        const colorClasses: Record<string, string> = {
            green: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
            yellow: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
            orange: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500",
            red: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
        };

        const statusLabels: Record<string, string> = {
            ok: t("suppliers.detail.stockStatus.ok"),
            warning: t("suppliers.detail.stockStatus.warning"),
            critical: t("suppliers.detail.stockStatus.critical"),
            empty: t("suppliers.detail.stockStatus.empty"),
        };

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[color] || colorClasses.green}`}>
                {statusLabels[status] || status}
            </span>
        );
    };

    // Loading state for supplier
    if (isLoadingSupplier) {
        return (
            <>
                <PageMeta title={`${t("common.loading")} | XetaSuite`} description={t("common.loading")} />
                <div className="flex h-96 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
            </>
        );
    }

    // Error state for supplier (404 - not found)
    if (supplierError || !supplier) {
        return (
            <>
                <PageMeta title={`${t("errors.notFound")} | XetaSuite`} description={t("errors.pageNotFound")} />
                <NotFoundContent
                    title={t("suppliers.notFound")}
                    message={t("suppliers.notFoundMessage")}
                    backTo="/suppliers"
                    backLabel={t("suppliers.detail.backToList")}
                />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`${supplier.name} | ${t("suppliers.title")} | XetaSuite`}
                description={supplier.description || t("suppliers.description")}
            />
            <PageBreadcrumb
                pageTitle={supplier.name}
                breadcrumbs={[{ label: t("suppliers.title"), path: "/suppliers" }, { label: supplier.name }]}
            />

            {/* Supplier Info Card */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <Link
                                to="/suppliers"
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                title={t("common.back")}
                            >
                                <FaArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{supplier.name}</h1>
                        </div>
                        {supplier.description && <p className="mt-3 text-gray-600 dark:text-gray-400">{supplier.description}</p>}
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                            <FaCubes className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{supplier.item_count}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("suppliers.detail.totalItems")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 dark:bg-success-500/20">
                            <FaUser className="h-5 w-5 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.creator?.full_name || "—"}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.creator")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-500/20">
                            <FaCalendar className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {SupplierManager.formatDate(supplier.created_at)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.createdAt")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{t("suppliers.detail.itemsListTitle")}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("suppliers.detail.itemsListDescription", { name: supplier.name })}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("suppliers.detail.searchItems")}
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
                </div>

                {/* Error message */}
                {itemsError && (
                    <div className="mx-6 mt-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                        {itemsError}
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
                                        {t("common.name")}
                                        {renderSortIcon("name")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("reference")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("suppliers.detail.reference")}
                                        {renderSortIcon("reference")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("current_stock")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("suppliers.detail.stock")}
                                        {renderSortIcon("current_stock")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("suppliers.detail.status")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("purchase_price")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("suppliers.detail.price")}
                                        {renderSortIcon("purchase_price")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("suppliers.detail.site")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingItems ? (
                                [...Array(5)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                                        {debouncedSearch ? (
                                            <div>
                                                <p>{t("suppliers.detail.noItemsFor", { search: debouncedSearch })}</p>
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t("common.clearSearch")}
                                                </button>
                                            </div>
                                        ) : (
                                            t("suppliers.detail.noItems")
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
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                {item.description && (
                                                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {item.reference || <span className="text-gray-400 dark:text-gray-500">—</span>}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="font-medium text-gray-900 dark:text-white">{item.current_stock}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            {getStockStatusBadge(item.stock_status, item.stock_status_color)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                                            {SupplierManager.formatCurrency(item.purchase_price, item.currency)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {item.site?.name || <span className="text-gray-400 dark:text-gray-500">—</span>}
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
        </>
    );
};

export default SupplierDetailPage;
