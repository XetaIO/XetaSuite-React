import { useState, useEffect, useCallback, type FC, type ChangeEvent } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaPlus,
    FaMagnifyingGlass,
    FaArrowUp,
    FaArrowDown,
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
import { useAuth } from "@/features/Auth";
import { useModal } from "@/shared/hooks";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { UserManager } from "../services";
import { UserModal } from "./UserModal";
import type { User, UserFilters } from "../types";
import type { PaginationMeta } from "@/shared/types";

type SortField = "first_name" | "last_name" | "email" | "username" | "created_at";
type SortDirection = "asc" | "desc";

const UserListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();

    // Users state
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters state
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortField>("last_name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Modals
    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions
    const canCreate = hasPermission("user.create");
    const canUpdate = hasPermission("user.update");
    const canDelete = hasPermission("user.delete");
    const canView = hasPermission("user.view");

    // Check if any action is available
    const hasAnyAction = canUpdate || canDelete;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const filters: UserFilters = {
            page: currentPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_direction: sortDirection,
        };

        const result = await UserManager.getAll(filters);

        if (result.success && result.data) {
            setUsers(result.data.data);
            setMeta(result.data.meta);
        } else {
            setError(result.error || t("errors.generic"));
        }

        setIsLoading(false);
    }, [currentPage, debouncedSearch, sortBy, sortDirection, t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
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
            fetchUsers();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
    };

    const handleCreateSuccess = () => {
        fetchUsers();
    };

    const handleUpdateSuccess = () => {
        fetchUsers();
    };

    const handleRestore = async (user: User) => {
        const result = await UserManager.restore(user.id);
        if (result.success) {
            showSuccess(t("users.messages.restored", { name: user.full_name }));
            fetchUsers();
        } else {
            showError(result.error || t("errors.generic"));
        }
    };

    const getUserActions = (user: User) => [
        { ...createActions.restore(() => handleRestore(user), t), hidden: !user.deleted_at || !canUpdate },
        { ...createActions.edit(() => handleEdit(user), t), hidden: !canUpdate },
        { ...createActions.delete(() => handleDeleteClick(user), t), hidden: !!user.deleted_at || !canDelete },
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
                    {canCreate && (
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
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("common.searchPlaceholder")}
                            value={searchQuery}
                            onChange={handleSearchChange}
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
                                        onClick={() => handleSort("last_name")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("common.user")}
                                        {renderSortIcon("last_name")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleSort("email")}
                                        className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {t("users.email")}
                                        {renderSortIcon("email")}
                                    </button>
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("users.rolesOnCurrentSite")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("users.sites")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("users.status")}
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
                                {hasAnyAction && (
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
                                        {hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="ml-auto h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={hasAnyAction ? 7 : 6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                                            t("users.noUsers")
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className={`border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${user.deleted_at ? 'opacity-60' : ''}`}>
                                        <TableCell className="px-6 py-4">
                                            {canView ? (
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
                                                <>
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
                                                </>
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
                                        {hasAnyAction && (
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
