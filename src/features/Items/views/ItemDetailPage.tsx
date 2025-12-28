import { useState, useEffect, useCallback, type FC } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaArrowLeft,
    FaArrowUp,
    FaArrowDown,
    FaMoneyBill,
    FaChartLine,
    FaTruckRampBox,
    FaCalendar,
    FaUser,
    FaTag,
    FaTriangleExclamation,
    FaCircleExclamation,
    FaWrench,
    FaUsers,
    FaCubes,
    FaQrcode,
    FaArrowRightArrowLeft,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, DeleteConfirmModal, Pagination } from "@/shared/components/common";
import { Badge, Table, TableHeader, TableBody, TableRow, TableCell, ActionsDropdown, createActions, LinkedName } from "@/shared/components/ui";
import { NotFoundContent } from "@/shared/components/errors";
import { useModal } from "@/shared/hooks";
import { showSuccess, showError, formatDateTime, formatDate, formatCurrency } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { useSettings } from "@/features/Settings";
import { ItemMovementModal, type MovementType } from "@/features/ItemMovements";
import { ItemManager } from "../services";
import { ItemModal } from "./ItemModal";
import { ItemQrCodeModal } from "./ItemQrCodeModal";
import { ItemStatsChart } from "./ItemStatsChart";
import { ItemPriceHistoryChart } from "./ItemPriceHistoryChart";
import type { ItemDetail, ItemMonthlyStats, ItemMaterial, ItemPriceHistory } from "../types";
import type { ItemMovement } from "@/features/ItemMovements/types";
import type { PaginationMeta } from "@/shared/types";

const ItemDetailPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();
    const { getCurrency } = useSettings();
    const [qrScanHandled, setQrScanHandled] = useState(false);

    const [item, setItem] = useState<ItemDetail | null>(null);
    const [movements, setMovements] = useState<ItemMovement[]>([]);
    const [movementsMeta, setMovementsMeta] = useState<PaginationMeta | null>(null);
    const [materials, setMaterials] = useState<ItemMaterial[]>([]);
    const [materialsMeta, setMaterialsMeta] = useState<PaginationMeta | null>(null);
    const [stats, setStats] = useState<ItemMonthlyStats[]>([]);
    const [priceHistory, setPriceHistory] = useState<ItemPriceHistory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
    const [isLoadingPriceHistory, setIsLoadingPriceHistory] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [movementsPage, setMovementsPage] = useState(1);
    const [materialsPage, setMaterialsPage] = useState(1);

    // Permissions
    const canUpdate = !isOnHeadquarters && hasPermission("item.update");
    const canDelete = !isOnHeadquarters && hasPermission("item.delete");
    const canGenerateQrCode = !isOnHeadquarters && hasPermission('item.generateQrCode');
    const canCreateMovement = hasPermission("item-movement.create");
    const canViewSupplier = hasPermission("supplier.view");
    const canViewCreatorAndRecipient = isOnHeadquarters && hasPermission("user.view");

    // Modals
    const itemModal = useModal();
    const deleteModal = useModal();
    const qrCodeModal = useModal();
    const movementModal = useModal();
    const [movementType, setMovementType] = useState<MovementType>("entry");

    const loadItem = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        const result = await ItemManager.getById(parseInt(id));
        if (result.success && result.data) {
            setItem(result.data.data);
        } else {
            setError(result.error || t("errors.generic"));
        }

        setIsLoading(false);
    }, [id, t]);

    const loadMovements = useCallback(async (page: number = 1) => {
        if (!id) return;

        setIsLoadingMovements(true);
        const result = await ItemManager.getMovements(parseInt(id), { page, per_page: 10 });
        if (result.success && result.data) {
            setMovements(result.data.data);
            setMovementsMeta(result.data.meta);
        }
        setIsLoadingMovements(false);
    }, [id]);

    const loadStats = useCallback(async () => {
        if (!id) return;

        const result = await ItemManager.getStats(parseInt(id), 12);
        if (result.success && result.data) {
            setStats(result.data);
        }
    }, [id]);

    const loadMaterials = useCallback(async (page: number = 1) => {
        if (!id) return;

        setIsLoadingMaterials(true);
        const result = await ItemManager.getMaterials(parseInt(id), page, 5);
        if (result.success && result.data) {
            setMaterials(result.data.data);
            setMaterialsMeta(result.data.meta);
        }
        setIsLoadingMaterials(false);
    }, [id]);

    const loadPriceHistory = useCallback(async () => {
        if (!id) return;

        setIsLoadingPriceHistory(true);
        const result = await ItemManager.getPriceHistory(parseInt(id), 20);
        if (result.success && result.data) {
            setPriceHistory(result.data);
        }
        setIsLoadingPriceHistory(false);
    }, [id]);

    useEffect(() => {
        loadItem();
        loadStats();
        loadPriceHistory();
    }, [loadItem, loadStats, loadPriceHistory]);

    // Handle QR code scan redirect: ?action=entry|exit
    useEffect(() => {
        if (qrScanHandled || isLoading || !item) return;

        const actionParam = searchParams.get("action");

        if (actionParam && (actionParam === "entry" || actionParam === "exit")) {
            // Mark as handled to prevent re-execution
            setQrScanHandled(true);

            // Clear URL params
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("action");
            setSearchParams(newParams, { replace: true });

            // Open movement modal
            setMovementType(actionParam as MovementType);
            movementModal.openModal();
        }
    }, [item, isLoading, qrScanHandled, searchParams, setSearchParams, movementModal]);

    useEffect(() => {
        loadMovements(movementsPage);
    }, [loadMovements, movementsPage]);

    useEffect(() => {
        loadMaterials(materialsPage);
    }, [loadMaterials, materialsPage]);

    const handleEdit = () => {
        itemModal.openModal();
    };

    const handleDelete = async () => {
        if (!item) return;

        setIsDeleting(true);
        const result = await ItemManager.delete(item.id);
        if (result.success) {
            showSuccess(t("items.messages.deleted", { name: item.name }));
            window.location.href = "/items";
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
        deleteModal.closeModal();
    };

    const handleQrCode = () => {
        qrCodeModal.openModal();
    };

    const handleMovement = (type: MovementType) => {
        setMovementType(type);
        movementModal.openModal();
    };

    const handleMovementSuccess = () => {
        loadItem();
        loadMovements(1);
        setMovementsPage(1);
        loadStats();
    };

    const handleModalSuccess = () => {
        loadItem();
    };

    if (isLoading) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <>
                <PageMeta title={`${t("errors.notFound")} | XetaSuite`} description={t("errors.pageNotFound")} />
                <NotFoundContent
                    title={t("items.notFound")}
                    message={t("items.notFoundMessage")}
                    backTo="/items"
                    backLabel={t("items.backToList")}
                />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`${item.name} | ${t("items.title")} | XetaSuite`}
                description={item.description || ""}
            />
            <PageBreadcrumb
                pageTitle={item.name}
                breadcrumbs={[
                    { label: t("items.title"), path: "/items" },
                    { label: item.name },
                ]}
            />

            {/* Header Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
                {/* Header Row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/items"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            title={t("common.back")}
                        >
                            <FaArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <FaCubes className="h-5 w-5 text-gray-400" />
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{item.name}</h1>
                                <Badge color={item.stock_status_color} size="md">
                                    {t(ItemManager.getStockStatusLabelKey(item.stock_status))}
                                </Badge>
                            </div>
                            {item.reference && (
                                <p className="mt-1 font-mono text-sm text-gray-500 dark:text-gray-400">
                                    {item.reference}
                                </p>
                            )}
                            {item.description && (
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <ActionsDropdown
                            align="left"
                            alignLg="right"
                            actions={[
                                { ...createActions.stockEntry(() => handleMovement("entry"), t), hidden: !canCreateMovement },
                                { ...createActions.stockExit(() => handleMovement("exit"), t), hidden: !canCreateMovement },
                                { ...createActions.qrCode(handleQrCode, t), hidden: !canGenerateQrCode },
                                { ...createActions.edit(handleEdit, t), hidden: !canUpdate },
                                { ...createActions.delete(() => deleteModal.openModal(), t), hidden: !canDelete },
                            ]}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                            <FaCubes className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {item.current_stock}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("items.fields.currentStock")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 dark:bg-success-500/20">
                            <FaArrowUp className="h-5 w-5 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {item.item_entry_total}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("items.stats.totalEntries")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100 dark:bg-error-500/20">
                            <FaArrowDown className="h-5 w-5 text-error-600 dark:text-error-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {item.item_exit_total}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("items.stats.totalExits")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-500/20">
                            <FaMoneyBill className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.current_price, getCurrency())}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("items.fields.price")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Item Information */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                        {t("items.detail.info")}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FaTruckRampBox className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.fields.supplier")}
                                </p>
                                <LinkedName
                                    canView={canViewSupplier}
                                    id={item.supplier?.id}
                                    name={item.supplier?.name}
                                    basePath="suppliers" />

                                {item.supplier_reference && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {t("items.fields.supplierReference")}: {item.supplier_reference}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaTag className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.fields.reference")}
                                </p>
                                <p className="font-mono text-gray-900 dark:text-white">
                                    {item.reference || <span className="text-gray-400">—</span>}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaUser className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("common.createdBy")}
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    <LinkedName
                                        canView={canViewCreatorAndRecipient}
                                        id={item.creator?.id}
                                        name={item.creator?.full_name}
                                        basePath="users" />
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaCalendar className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("common.createdAt")}
                                </p>
                                <p className="text-gray-900 dark:text-white">{formatDate(item.created_at)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaQrcode className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.fields.qrCodeScans")}
                                </p>
                                <p className="text-gray-900 dark:text-white">{item.qrcode_flash_count}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Alert Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
                        <FaTriangleExclamation className="h-4 w-4" />
                        {t("items.sections.stockAlerts")}
                    </h3>

                    <div className="space-y-4">
                        {/* Warning threshold */}
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-500/20">
                                    <FaCircleExclamation className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {t("items.alerts.warning")}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("items.alerts.warningDescription")}
                                    </p>
                                </div>
                            </div>
                            {item.number_warning_enabled ? (
                                <Badge color="warning" size="md">
                                    ≤ {item.number_warning_minimum}
                                </Badge>
                            ) : (
                                <Badge color="dark" size="md">{t("common.disabled")}</Badge>
                            )}
                        </div>

                        {/* Critical threshold */}
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-100 dark:bg-error-500/20">
                                    <FaTriangleExclamation className="h-4 w-4 text-error-600 dark:text-error-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {t("items.alerts.critical")}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("items.alerts.criticalDescription")}
                                    </p>
                                </div>
                            </div>
                            {item.number_critical_enabled ? (
                                <Badge color="error" size="md">
                                    ≤ {item.number_critical_minimum}
                                </Badge>
                            ) : (
                                <Badge color="dark" size="md">{t("common.disabled")}</Badge>
                            )}
                        </div>
                    </div>

                    {/* Related Recipients */}
                    {item.recipients && item.recipients.length > 0 && (
                        <div className="mt-6">
                            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <FaUsers className="h-4 w-4" />
                                {t("items.sections.recipients")} ({item.recipients.length})
                            </p>
                            <div className="space-y-2">
                                {item.recipients.map((recipient) => (
                                    <div
                                        key={recipient.id}
                                        className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                                            {recipient.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            <LinkedName
                                                canView={canViewCreatorAndRecipient}
                                                id={recipient.id}
                                                name={recipient.full_name}
                                                basePath="users" />
                                            {recipient.email && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {recipient.email}
                                                </p>
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Materials */}
            {(materialsMeta && materialsMeta.total > 0) && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                    <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                        <FaWrench className="h-5 w-5 text-brand-500" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {t("items.sections.materials")}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({materialsMeta.total})
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoadingMaterials ? (
                            [...Array(3)].map((_, index) => (
                                <div key={index} className="flex items-center gap-3 px-6 py-4">
                                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div className="flex-1">
                                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            materials.map((material) => (
                                <Link
                                    key={material.id}
                                    to={`/materials/${material.id}`}
                                    className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                                        <FaWrench className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {material.name}
                                        </p>
                                        {material.zone && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {material.zone.name}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {materialsMeta && materialsMeta.last_page > 1 && (
                        <Pagination
                            meta={materialsMeta}
                            onPageChange={setMaterialsPage}
                        />
                    )}
                </div>
            )}

            {/* Statistics Chart */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
                    <FaChartLine className="h-5 w-5 text-brand-500" />
                    {t("items.stats.title")}
                </h3>
                <ItemStatsChart stats={stats} />
            </div>

            {/* Movements History */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <FaArrowRightArrowLeft className="h-5 w-5 text-brand-500" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t("items.movements.history")}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-800">
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.movements.fields.notes")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.movements.fields.type")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.movements.fields.quantity")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.movements.fields.price")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.movements.fields.createdBy")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("items.movements.fields.date")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingMovements ? (
                                [...Array(5)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
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
                                    </TableRow>
                                ))
                            ) : movements.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                                        {t("items.movements.noMovements")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                movements.map((movement) => (
                                    <TableRow key={movement.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                                        <TableCell className="px-6 py-4 text-gray-900 dark:text-white">
                                            {movement.notes || "—"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge
                                                color={movement.type === "entry" ? "success" : "error"}
                                                size="sm"
                                            >
                                                {movement.type === "entry"
                                                    ? t("items.movements.entry")
                                                    : t("items.movements.exit")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span
                                                className={
                                                    movement.type === "entry"
                                                        ? "font-semibold text-success-600"
                                                        : "font-semibold text-error-600"
                                                }
                                            >
                                                {ItemManager.formatMovementQuantity(
                                                    movement.type,
                                                    movement.quantity
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {movement.total_price > 0
                                                ? formatCurrency(
                                                    movement.total_price,
                                                    getCurrency()
                                                )
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewCreatorAndRecipient}
                                                id={movement.creator?.id}
                                                name={movement.creator?.full_name}
                                                basePath="users" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDateTime(movement.movement_date)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {movementsMeta && movementsMeta.last_page > 1 && (
                    <Pagination
                        meta={movementsMeta}
                        onPageChange={setMovementsPage}
                    />
                )}
            </div>

            {/* Price History Chart */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
                    <FaChartLine className="h-5 w-5 text-brand-500" />
                    {t("items.priceHistory.title")}
                </h3>
                <ItemPriceHistoryChart
                    priceHistory={priceHistory}
                    isLoading={isLoadingPriceHistory}
                />
            </div>

            {/* Modals */}
            <ItemModal
                isOpen={itemModal.isOpen}
                onClose={itemModal.closeModal}
                item={item}
                onSuccess={handleModalSuccess}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title={t("items.delete.title")}
                message={t("items.delete.message", { name: item.name })}
            />

            <ItemQrCodeModal
                isOpen={qrCodeModal.isOpen}
                onClose={qrCodeModal.closeModal}
                item={item}
            />

            <ItemMovementModal
                isOpen={movementModal.isOpen}
                onClose={movementModal.closeModal}
                item={item}
                type={movementType}
                onSuccess={handleMovementSuccess}
            />
        </>
    );
};

export default ItemDetailPage;
