import { useState, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaArrowRightToBracket,
    FaArrowRightFromBracket,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, ActionsDropdown, createActions, LinkedName, SortableTableHeader, StaticTableHeader, ListPageCard, ListPageHeader, SearchSection, ErrorAlert, TableSkeletonRows, EmptyTableRow } from "@/shared/components/ui";
import { useModal, useListPage } from "@/shared/hooks";
import { showSuccess, showError, formatCurrency } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { ItemMovementManager } from "../services";
import { ItemMovementModal } from "./ItemMovementModal";
import type { ItemMovement, ItemMovementFilters, MovementType } from "../types";

const ItemMovementListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Custom filters specific to item movements
    const [typeFilter, setTypeFilter] = useState<MovementType | "">("");

    // Use shared list hook with custom filters
    const {
        items: movements,
        meta,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        handleSort,
        renderSortIcon,
        handlePageChange,
        refresh,
        setCurrentPage,
    } = useListPage<ItemMovement, ItemMovementFilters>({
        fetchFn: ItemMovementManager.getAll,
        defaultSortField: "movement_date",
        defaultSortDirection: "desc",
        additionalFilters: {
            type: typeFilter || undefined,
        },
    });

    // Selected movement for operations
    const [selectedMovement, setSelectedMovement] = useState<ItemMovement | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions - item movements use item permissions
    const canUpdate = hasPermission("item.update");
    const canViewItem = hasPermission("item.view");
    const canViewSite = isOnHeadquarters && hasPermission("site.view");
    const canViewCreator = isOnHeadquarters && hasPermission("user.view");
    const canViewSupplier = hasPermission("supplier.view");

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();

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
        setSearchQuery("");
        setTypeFilter("");
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

            <ListPageCard>
                <ListPageHeader
                    title={t("itemMovements.listTitle")}
                    description={t("itemMovements.listDescription")}
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder={t("itemMovements.searchPlaceholder")}
                    rightContent={
                        <>
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-sm text-brand-500 hover:text-brand-600"
                                >
                                    {t("common.clearFilters")}
                                </button>
                            )}
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
                        </>
                    }
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                {isOnHeadquarters && (
                                    <StaticTableHeader label={t("itemMovements.fields.site")} />
                                )}
                                <SortableTableHeader
                                    field="movement_date"
                                    label={t("itemMovements.fields.movementDate")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <SortableTableHeader
                                    field="type"
                                    label={t("itemMovements.fields.type")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t("itemMovements.fields.item")} />
                                <SortableTableHeader
                                    field="quantity"
                                    label={t("itemMovements.fields.quantity")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <SortableTableHeader
                                    field="total_price"
                                    label={t("itemMovements.fields.totalPrice")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t("itemMovements.fields.supplier")} />
                                <StaticTableHeader label={t("itemMovements.fields.createdBy")} />
                                <StaticTableHeader label={t("common.actions")} align="right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows
                                    count={6}
                                    cells={[
                                        ...(isOnHeadquarters ? [{ width: 'w-24' }] : []),
                                        { width: 'w-24' },
                                        { width: 'w-16' },
                                        { width: 'w-32' },
                                        { width: 'w-12' },
                                        { width: 'w-16' },
                                        { width: 'w-24' },
                                        { width: 'w-20' },
                                        { width: 'w-8', right: true },
                                    ]}
                                />
                            ) : movements.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={isOnHeadquarters ? 9 : 8}
                                    searchQuery={hasActiveFilters ? searchQuery : ''}
                                    onClearSearch={handleClearFilters}
                                    emptyMessage={t("itemMovements.noMovements")}
                                    noResultsMessage={t("itemMovements.noResultsWithFilters")}
                                />
                            ) : (
                                movements.map((movement) => (
                                    <TableRow
                                        key={movement.id}
                                        className="table-row-hover"
                                    >
                                        {isOnHeadquarters && (
                                            <TableCell className="px-6 py-4">
                                                <LinkedName
                                                    canView={canViewSite}
                                                    id={movement?.item?.site?.id}
                                                    name={movement?.item?.site?.name}
                                                    basePath="sites" />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {ItemMovementManager.formatDate(movement.movement_date)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            {getTypeBadge(movement.type)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            {movement.item && canViewItem ? (
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
                                            {movement.supplier && canViewSupplier ? (
                                                <Link
                                                    to={`/suppliers/${movement.supplier_id}`}
                                                    className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                                                >
                                                    {movement.supplier.name}
                                                    {movement.supplier_invoice_number && (
                                                        <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            ({movement.supplier_invoice_number})
                                                        </span>
                                                    )}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">
                                                    {movement.supplier_name || "—"}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewCreator}
                                                id={movement.creator?.id}
                                                name={movement.creator?.full_name || movement.created_by_name}
                                                basePath="users" />
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
                {meta && meta.last_page > 1 && (
                    <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                        <Pagination meta={meta} onPageChange={handlePageChange} />
                    </div>
                )}
            </ListPageCard>

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
