import { useState, useCallback, useEffect, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaPlus, FaCubes } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Button, Badge, ActionsDropdown, createActions, LinkedName, SortableTableHeader, StaticTableHeader, ListPageCard, ListPageHeader, SearchSection, ErrorAlert, TableSkeletonRows, EmptyTableRow } from "@/shared/components/ui";
import { useModal, useListPage, useEntityPermissions } from "@/shared/hooks";
import { showSuccess, showError, formatCurrency } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { useSettings } from "@/features/Settings";
import { ItemMovementModal } from "@/features/ItemMovements";
import type { MovementType } from "@/features/ItemMovements";
import { ItemManager } from "../services";
import { ItemModal } from "./ItemModal";
import { ItemQrCodeModal } from "./ItemQrCodeModal";
import type { Item, ItemFilters, StockStatus } from "../types";

const ItemListPage: FC = () => {
    const { t } = useTranslation();
    const { isOnHeadquarters, hasPermission } = useAuth();
    const { getCurrency } = useSettings();

    // Custom filter state (specific to this page)
    const [stockStatusFilter, setStockStatusFilter] = useState<StockStatus | "">("");

    // Use custom hooks for list management
    const {
        items,
        meta,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        handlePageChange,
        handleSort,
        renderSortIcon,
        refresh,
    } = useListPage<Item, ItemFilters>({
        fetchFn: useCallback(async (filters: ItemFilters) => {
            return ItemManager.getAll({
                ...filters,
                stock_status: stockStatusFilter || undefined,
            });
        }, [stockStatusFilter]),
    });

    // Permissions using custom hook
    const { canView, canCreate, canUpdate, canDelete, canGenerateQrCode } = useEntityPermissions("item", { hasPermission, isOnHeadquarters });
    const canCreateMovement = hasPermission("item-movement.create");
    const canViewSite = isOnHeadquarters && hasPermission("site.view");
    const canViewCompany = hasPermission("company.view");

    // Selected item for operations
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modals
    const itemModal = useModal();
    const deleteModal = useModal();
    const qrCodeModal = useModal();
    const movementModal = useModal();
    const [movementType, setMovementType] = useState<MovementType>("entry");

    // Refresh when stockStatusFilter changes
    useEffect(() => {
        refresh();
    }, [stockStatusFilter, refresh]);

    // Handlers
    const handleCreate = useCallback(() => {
        setSelectedItem(null);
        itemModal.openModal();
    }, [itemModal]);

    const handleEdit = useCallback((item: Item) => {
        setSelectedItem(item);
        itemModal.openModal();
    }, [itemModal]);

    const handleDeleteClick = useCallback((item: Item) => {
        setSelectedItem(item);
        deleteModal.openModal();
    }, [deleteModal]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedItem) return;

        setIsDeleting(true);
        const result = await ItemManager.delete(selectedItem.id);
        if (result.success) {
            showSuccess(t("items.messages.deleted", { name: selectedItem.name }));
            setSelectedItem(null);
            refresh();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
        deleteModal.closeModal();
    }, [selectedItem, t, deleteModal, refresh]);

    const handleQrCode = useCallback((item: Item) => {
        setSelectedItem(item);
        qrCodeModal.openModal();
    }, [qrCodeModal]);

    const handleMovement = useCallback((item: Item, type: MovementType) => {
        setSelectedItem(item);
        setMovementType(type);
        movementModal.openModal();
    }, [movementModal]);

    const handleModalSuccess = useCallback(() => {
        refresh();
    }, [refresh]);

    const getItemActions = useCallback((item: Item) => [
        { ...createActions.stockEntry(() => handleMovement(item, "entry"), t), hidden: !canCreateMovement },
        { ...createActions.stockExit(() => handleMovement(item, "exit"), t), hidden: !canCreateMovement },
        { ...createActions.qrCode(() => handleQrCode(item), t), hidden: !canGenerateQrCode },
        { ...createActions.edit(() => handleEdit(item), t), hidden: !canUpdate },
        { ...createActions.delete(() => handleDeleteClick(item), t), hidden: !canDelete },
    ], [t, canCreateMovement, canGenerateQrCode, canUpdate, canDelete, handleMovement, handleQrCode, handleEdit, handleDeleteClick]);

    // Check if any action is available
    const hasAnyAction = canUpdate || canDelete || canGenerateQrCode || canCreateMovement;

    const getStockStatusOptions = (): { value: StockStatus | ""; label: string }[] => [
        { value: "", label: t("items.filters.allStatuses") },
        { value: "ok", label: t("items.stockStatus.ok") },
        { value: "warning", label: t("items.stockStatus.warning") },
        { value: "critical", label: t("items.stockStatus.critical") },
        { value: "empty", label: t("items.stockStatus.empty") },
    ];

    const handleClearFilters = useCallback(() => {
        setSearchQuery("");
        setStockStatusFilter("");
    }, [setSearchQuery]);

    const hasActiveFilters = searchQuery || stockStatusFilter;

    const skeletonCells = [
        { width: 'w-32', hasIcon: true },
        ...(isOnHeadquarters ? [{ width: 'w-24' }] : []),
        { width: 'w-20' },
        { width: 'w-12' },
        { width: 'w-16', rounded: 'rounded-full' as const },
        { width: 'w-16' },
        { width: 'w-24' },
        ...(hasAnyAction ? [{ width: 'w-20', align: 'right' as const }] : []),
    ];
    const colSpan = 7 + (isOnHeadquarters ? 1 : 0) + (hasAnyAction ? 1 : 0);

    return (
        <>
            <PageMeta title={`${t("items.title")} | XetaSuite`} description={t("items.description")} />
            <PageBreadcrumb pageTitle={t("items.title")} breadcrumbs={[{ label: t("items.title") }]} />

            <ListPageCard>
                <ListPageHeader
                    title={t("items.listTitle")}
                    description={t("items.manageItemsAndStock")}
                    actions={
                        canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t("items.create")}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder={t("items.searchPlaceholder")}
                    rightContent={
                        <div className="flex items-center gap-4">
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters} className="text-sm text-brand-500 hover:text-brand-600">
                                    {t("common.clearFilters")}
                                </button>
                            )}
                            <select
                                value={stockStatusFilter}
                                onChange={(e) => setStockStatusFilter(e.target.value as StockStatus | "")}
                                title={t("items.filters.stockStatus")}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                {getStockStatusOptions().map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    }
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                <SortableTableHeader field="name" label={t("items.fields.name")} onSort={handleSort} renderSortIcon={renderSortIcon} />
                                {isOnHeadquarters && (
                                    <StaticTableHeader label={t("items.fields.site")} />
                                )}
                                <SortableTableHeader field="reference" label={t("items.fields.reference")} onSort={handleSort} renderSortIcon={renderSortIcon} />
                                <SortableTableHeader field="current_stock" label={t("items.fields.stock")} onSort={handleSort} renderSortIcon={renderSortIcon} />
                                <StaticTableHeader label={t("items.fields.status")} />
                                <SortableTableHeader field="current_price" label={t("items.fields.price")} onSort={handleSort} renderSortIcon={renderSortIcon} />
                                <StaticTableHeader label={t("items.fields.company")} />
                                {hasAnyAction && (
                                    <StaticTableHeader label={t("common.actions")} align="right" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows count={6} cells={skeletonCells} />
                            ) : items.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch || stockStatusFilter}
                                    onClearSearch={handleClearFilters}
                                    emptyMessage={t("items.noItems")}
                                />
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id} className="table-row-hover">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaCubes className="h-4 w-4 text-gray-400" />
                                                {canView ? (
                                                    <Link to={`/items/${item.id}`} className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                                                        {item.name}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</p>
                                            )}
                                        </TableCell>
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4">
                                                <LinkedName canView={canViewSite} id={item.site?.id} name={item.site?.name} basePath="sites" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <span className="font-mono text-sm">{item.reference || "—"}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-semibold text-gray-900 dark:text-white">{item.current_stock}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge color={item.stock_status_color} size="sm">
                                                {t(ItemManager.getStockStatusLabelKey(item.stock_status))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatCurrency(item.current_price, getCurrency())}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName canView={canViewCompany} id={item.company?.id} name={item.company?.name} basePath="companies" />
                                        </TableCell>
                                        {hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getItemActions(item)} />
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

            {/* Modals */}
            <ItemModal isOpen={itemModal.isOpen} onClose={itemModal.closeModal} item={selectedItem} onSuccess={handleModalSuccess} />
            <DeleteConfirmModal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} onConfirm={handleDeleteConfirm} isLoading={isDeleting} title={t("items.delete.title")} message={t("items.delete.message", { name: selectedItem?.name })} />
            <ItemQrCodeModal isOpen={qrCodeModal.isOpen} onClose={qrCodeModal.closeModal} item={selectedItem} />
            <ItemMovementModal isOpen={movementModal.isOpen} onClose={movementModal.closeModal} item={selectedItem} type={movementType} onSuccess={handleModalSuccess} />
        </>
    );
};

export default ItemListPage;
