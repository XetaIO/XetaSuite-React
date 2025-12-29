import { useState, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaPlus,
    FaLock,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Badge,
    ActionsDropdown,
    createActions,
    SortableTableHeader,
    StaticTableHeader,
} from "@/shared/components/ui";
import { SearchInput } from "@/shared/components/form";
import { useModal, useListPage, useEntityPermissions } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { PermissionManager } from "../services";
import { PermissionModal } from "./PermissionModal";
import type { Permission, PermissionDetail, PermissionFilters } from "../types";

const PermissionListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: permissions,
        meta,
        isLoading,
        setIsLoading,
        error,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        handleSort,
        renderSortIcon,
        handlePageChange,
        refresh,
    } = useListPage<Permission, PermissionFilters>({
        fetchFn: PermissionManager.getAll,
        defaultSortField: "name",
        defaultSortDirection: "asc",
    });

    // Modals
    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();
    const [permissionToEdit, setPermissionToEdit] = useState<PermissionDetail | null>(null);
    const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions - permission is HQ-only
    const permissionChecks = useEntityPermissions("permission", { hasPermission, isOnHeadquarters }, { hqOnly: true });

    const handleEdit = async (permission: Permission) => {
        setIsLoading(true);
        const result = await PermissionManager.getById(permission.id);
        if (result.success && result.data) {
            setPermissionToEdit(result.data.data);
            editModal.openModal();
        } else {
            showError(t("errors.generic"));
        }
        setIsLoading(false);
    };

    const handleDeleteClick = (permission: Permission) => {
        setPermissionToDelete(permission);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!permissionToDelete) return;

        setIsDeleting(true);
        const result = await PermissionManager.delete(permissionToDelete.id);

        if (result.success) {
            showSuccess(t("common.messages.deleted", { name: permissionToDelete.name }));
            deleteModal.closeModal();
            setPermissionToDelete(null);
            refresh();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
    };

    const handleCreateSuccess = () => {
        refresh();
    };

    const handleUpdateSuccess = () => {
        refresh();
    };

    const getPermissionActions = (permission: Permission) => [
        { ...createActions.edit(() => handleEdit(permission), t), hidden: !permissionChecks.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(permission), t), hidden: !permissionChecks.canDelete },
    ];

    return (
        <>
            <PageMeta
                title={`${t("permissions.title")} | XetaSuite`}
                description={t("permissions.description")}
            />
            <PageBreadcrumb pageTitle={t("permissions.title")} />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("permissions.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("permissions.managePermissions")}
                        </p>
                    </div>
                    {permissionChecks.canCreate && (
                        <Button
                            variant="primary"
                            size="sm"
                            startIcon={<FaPlus className="h-4 w-4" />}
                            onClick={() => createModal.openModal()}
                        >
                            {t("permissions.create")}
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="card-body-border">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t("permissions.searchPlaceholder")}
                    />
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
                                <SortableTableHeader
                                    field="name"
                                    label={t("permissions.name")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <SortableTableHeader
                                    field="roles_count"
                                    label={t("permissions.roles")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="created_at"
                                    label={t("common.createdAt")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                {permissionChecks.hasAnyAction && (
                                    <StaticTableHeader label={t("common.actions")} align="right" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(6)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {permissionChecks.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="ml-auto h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : permissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={permissionChecks.hasAnyAction ? 4 : 3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FaLock className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            {debouncedSearch ? (
                                                <div>
                                                    <p>{t("permissions.noPermissionsFor", { search: debouncedSearch })}</p>
                                                    <button
                                                        onClick={() => setSearchQuery("")}
                                                        className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                    >
                                                        {t("common.clearSearch")}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p>{t("permissions.noPermissions")}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                permissions.map((permission) => (
                                    <TableRow key={permission.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/2">
                                        <TableCell className="px-6 py-4">
                                            {permissionChecks.canView ? (
                                                <Link
                                                    to={`/permissions/${permission.id}`}
                                                    className="font-medium font-mono text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                                                >
                                                    {permission.name}
                                                </Link>
                                            ) : (
                                                <span className="font-medium font-mono text-sm text-gray-800 dark:text-white/90">
                                                    {permission.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge variant="light" color="brand">
                                                {permission.roles_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(permission.created_at)}
                                        </TableCell>
                                        {permissionChecks.hasAnyAction && (
                                            <TableCell className="px-6 py-4 text-right">
                                                <ActionsDropdown actions={getPermissionActions(permission)} />
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
                        <Pagination
                            meta={meta}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <PermissionModal
                isOpen={createModal.isOpen}
                onClose={createModal.closeModal}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Modal */}
            {permissionToEdit && (
                <PermissionModal
                    isOpen={editModal.isOpen}
                    onClose={() => {
                        editModal.closeModal();
                        setPermissionToEdit(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    permission={permissionToEdit}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => {
                    deleteModal.closeModal();
                    setPermissionToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("permissions.confirmDelete")}
                message={t("permissions.confirmDeleteMessage", { name: permissionToDelete?.name || "" })}
            />
        </>
    );
};

export default PermissionListPage;
