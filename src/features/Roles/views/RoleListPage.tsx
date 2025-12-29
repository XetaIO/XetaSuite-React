import { useState, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaPlus,
    FaMagnifyingGlass,
    FaShieldHalved,
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
} from "@/shared/components/ui";
import { useModal, useListPage, useEntityPermissions } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { RoleManager } from "../services";
import { RoleModal } from "./RoleModal";
import type { Role, RoleDetail, RoleFilters } from "../types";

type SortField = "name" | "created_at" | "permissions_count" | "users_count";

const RoleListPage: FC = () => {
    const { t } = useTranslation();

    // Use shared list hook
    const {
        items: roles,
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
    } = useListPage<Role, RoleFilters>({
        fetchFn: RoleManager.getAll,
        defaultSortField: "name",
        defaultSortDirection: "asc",
    });

    // Modals
    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();
    const [roleToEdit, setRoleToEdit] = useState<RoleDetail | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions - role is HQ-only
    const permissions = useEntityPermissions("role", { hqOnly: true });

    const handleEdit = async (role: Role) => {
        setIsLoading(true);
        const result = await RoleManager.getById(role.id);
        if (result.success && result.data) {
            setRoleToEdit(result.data.data);
            editModal.openModal();
        } else {
            showError(t("errors.generic"));
        }
        setIsLoading(false);
    };

    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;

        setIsDeleting(true);
        const result = await RoleManager.delete(roleToDelete.id);

        if (result.success) {
            showSuccess(t("common.messages.deleted", { name: roleToDelete.name }));
            deleteModal.closeModal();
            setRoleToDelete(null);
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

    const getRoleActions = (role: Role) => [
        { ...createActions.edit(() => handleEdit(role), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(role), t), hidden: !permissions.canDelete },
    ];

    return (
        <>
            <PageMeta
                title={`${t("roles.title")} | XetaSuite`}
                description={t("roles.description")}
            />
            <PageBreadcrumb pageTitle={t("roles.title")} />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("roles.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("roles.manageRolesAndPermissions")}
                        </p>
                    </div>
                    {permissions.canCreate && (
                        <Button
                            variant="primary"
                            size="sm"
                            startIcon={<FaPlus className="h-4 w-4" />}
                            onClick={() => createModal.openModal()}
                        >
                            {t("roles.create")}
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("roles.searchPlaceholder")}
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
                                        {t("roles.name")}
                                        {renderSortIcon("name")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("permissions_count")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("roles.permissions")}
                                        {renderSortIcon("permissions_count")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("users_count")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("roles.users")}
                                        {renderSortIcon("users_count")}
                                    </button>
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
                                [...Array(6)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="ml-auto h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={permissions.hasAnyAction ? 5 : 4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FaShieldHalved className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            {debouncedSearch ? (
                                                <div>
                                                    <p>{t("roles.noRolesFor", { search: debouncedSearch })}</p>
                                                    <button
                                                        onClick={() => setSearchQuery("")}
                                                        className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                    >
                                                        {t("common.clearSearch")}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p>{t("roles.noRoles")}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/2">
                                        <TableCell className="px-6 py-4">
                                            {permissions.canView ? (
                                                <Link
                                                    to={`/roles/${role.id}`}
                                                    className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                                                >
                                                    {role.name}
                                                </Link>
                                            ) : (
                                                <span className="font-medium text-gray-800 dark:text-white/90">
                                                    {role.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge variant="light" color="brand">
                                                {role.permissions_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge variant="light" color="info">
                                                {role.users_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(role.created_at)}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4 text-right">
                                                <ActionsDropdown actions={getRoleActions(role)} />
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
            <RoleModal
                isOpen={createModal.isOpen}
                onClose={createModal.closeModal}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Modal */}
            {roleToEdit && (
                <RoleModal
                    isOpen={editModal.isOpen}
                    onClose={() => {
                        editModal.closeModal();
                        setRoleToEdit(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    role={roleToEdit}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => {
                    deleteModal.closeModal();
                    setRoleToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("roles.confirmDelete")}
                message={t("roles.confirmDeleteMessage", { name: roleToDelete?.name || "" })}
            />
        </>
    );
};

export default RoleListPage;
