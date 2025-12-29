import { useState, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaPlus,
    FaUsers,
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
import { UserManager } from "../services";
import { UserModal } from "./UserModal";
import type { User, UserFilters } from "../types";

const UserListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: users,
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
    } = useListPage<User, UserFilters>({
        fetchFn: UserManager.getAll,
        defaultSortField: "last_name",
        defaultSortDirection: "asc",
    });

    // Modals
    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions - user is HQ-only
    const permissions = useEntityPermissions("user", { hasPermission, isOnHeadquarters }, { hqOnly: true });

    const handleEdit = async (user: User) => {
        setIsLoading(true);
        const result = await UserManager.getById(user.id);
        if (result.success && result.data) {
            setSelectedUser(result.data.data);
            editModal.openModal();
        } else {
            showError(t("errors.generic"));
        }
        setIsLoading(false);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        setIsDeleting(true);
        const result = await UserManager.delete(selectedUser.id);

        if (result.success) {
            showSuccess(t("common.messages.deleted", { name: selectedUser.full_name }));
            deleteModal.closeModal();
            setSelectedUser(null);
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

    const handleRestore = async (user: User) => {
        const result = await UserManager.restore(user.id);
        if (result.success) {
            showSuccess(t("users.messages.restored", { name: user.full_name }));
            refresh();
        } else {
            showError(result.error || t("errors.generic"));
        }
    };

    const getUserActions = (user: User) => [
        { ...createActions.restore(() => handleRestore(user), t), hidden: !user.deleted_at || !permissions.canUpdate },
        { ...createActions.edit(() => handleEdit(user), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(user), t), hidden: !!user.deleted_at || !permissions.canDelete },
    ];

    return (
        <>
            <PageMeta
                title={`${t("users.title")} | XetaSuite`}
                description={t("users.description")}
            />
            <PageBreadcrumb pageTitle={t("users.title")} />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("users.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("users.manageUsersAndPermissions")}
                        </p>
                    </div>
                    {permissions.canCreate && (
                        <Button
                            variant="primary"
                            size="sm"
                            startIcon={<FaPlus className="h-4 w-4" />}
                            onClick={() => createModal.openModal()}
                        >
                            {t("users.create")}
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="card-body-border">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
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
                                    field="last_name"
                                    label={t("common.user")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <SortableTableHeader
                                    field="email"
                                    label={t("users.email")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t("users.rolesOnCurrentSite")} align="center" />
                                <StaticTableHeader label={t("users.sites")} align="center" />
                                <StaticTableHeader label={t("users.status")} align="center" />
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
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                                <div>
                                                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                                    <div className="mt-1 h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
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
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={permissions.hasAnyAction ? 7 : 6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FaUsers className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            {debouncedSearch ? (
                                                <div>
                                                    <p>{t("users.noUsersFor", { search: debouncedSearch })}</p>
                                                    <button
                                                        onClick={() => setSearchQuery("")}
                                                        className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                    >
                                                        {t("common.clearSearch")}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p>{t("users.noUsers")}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className={`border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${user.deleted_at ? 'opacity-60' : ''}`}>
                                        <TableCell className="px-6 py-4">
                                            {permissions.canView ? (
                                                <Link
                                                    to={`/users/${user.id}`}
                                                    className="flex items-center gap-3 hover:text-brand-600 dark:hover:text-brand-400"
                                                >
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.full_name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {user.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            @{user.username}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.full_name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {user.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            @{user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            {user.roles && user.roles.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {user.roles.slice(0, 2).map((role) => (
                                                        <Badge key={role} color="brand" size="sm">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                    {user.roles.length > 2 && (
                                                        <Badge color="light" size="sm">
                                                            +{user.roles.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            {user.sites && user.sites.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {user.sites.slice(0, 2).map((site) => (
                                                        <Badge
                                                            key={site.id}
                                                            color={site.is_headquarters ? "brand" : "light"}
                                                            size="sm"
                                                        >
                                                            {site.name}
                                                        </Badge>
                                                    ))}
                                                    {user.sites.length > 2 && (
                                                        <Badge color="light" size="sm">
                                                            +{user.sites.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge color={user.deleted_at ? "error" : "success"} size="sm">
                                                {user.deleted_at ? t("users.deleted") : t("users.active")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {user.created_at ? formatDate(user.created_at) : "—"}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getUserActions(user)} />
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
                {meta && meta.last_page > 1 && (
                    <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                        <Pagination meta={meta} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <UserModal
                isOpen={createModal.isOpen}
                onClose={createModal.closeModal}
                user={null}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Modal */}
            <UserModal
                isOpen={editModal.isOpen}
                onClose={() => {
                    editModal.closeModal();
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onSuccess={handleUpdateSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => {
                    deleteModal.closeModal();
                    setSelectedUser(null);
                }}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("users.deleteTitle")}
                message={t("common.confirmDelete", { name: selectedUser?.full_name || "" })}
            />
        </>
    );
};

export default UserListPage;
