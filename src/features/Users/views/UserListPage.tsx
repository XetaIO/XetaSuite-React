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
    ListPageCard,
    ListPageHeader,
    SearchSection,
    ErrorAlert,
    TableSkeletonRows,
    EmptyTableRow,
} from "@/shared/components/ui";
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
        defaultSortField: "full_name",
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
            setSelectedUser(null);
            refresh();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
        deleteModal.closeModal();
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

    const skeletonCells = [
        { width: "w-32" },
        { width: "w-40" },
        { width: "w-16", center: true },
        { width: "w-16", center: true },
        { width: "w-16", center: true },
        { width: "w-24" },
        ...(permissions.hasAnyAction ? [{ width: "w-8", right: true }] : []),
    ];

    return (
        <>
            <PageMeta
                title={`${t("users.title")} | XetaSuite`}
                description={t("users.description")}
            />
            <PageBreadcrumb pageTitle={t("users.title")} />

            <ListPageCard>
                <ListPageHeader
                    title={t("users.listTitle")}
                    description={t("users.manageUsersAndPermissions")}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={() => createModal.openModal()}
                            >
                                {t("users.create")}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                <SortableTableHeader
                                    field="full_name"
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
                                <TableSkeletonRows
                                    count={6}
                                    cells={skeletonCells}
                                />
                            ) : users.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={6 + (permissions.hasAnyAction ? 1 : 0)}
                                    searchQuery={debouncedSearch}
                                    onClearSearch={() => setSearchQuery("")}
                                    emptyMessage={
                                        <div className="flex flex-col items-center justify-center">
                                            <FaUsers className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            <p>{t("users.noUsers")}</p>
                                        </div>
                                    }
                                    noResultsMessage={t("users.noUsersFor", { search: debouncedSearch })}
                                />
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className={`table-row-hover ${user.deleted_at ? 'opacity-60' : ''}`}>
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
                {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
            </ListPageCard>

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
