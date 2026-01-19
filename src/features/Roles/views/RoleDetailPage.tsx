import { useState, useEffect, useCallback, useMemo, type FC } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaArrowLeft,
    FaCalendar,
    FaPenToSquare,
    FaShield,
    FaUsers,
    FaKey,
    FaMagnifyingGlass,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination } from "@/shared/components/common";
import { Button, Table, TableHeader, TableBody, TableRow, TableCell, Badge, Avatar, LinkedName } from "@/shared/components/ui";
import { NotFoundContent } from "@/shared/components/errors";
import { useModal } from "@/shared/hooks";
import type { PaginationMeta } from "@/shared/types";
import { formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { RoleManager } from "../services";
import { RoleModal } from "./RoleModal";
import type { RoleDetail, RoleUser } from "../types";

type TabType = "permissions" | "users";

const RoleDetailPage: FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { hasPermission } = useAuth();
    const roleId = Number(id);

    // Role state
    const [role, setRole] = useState<RoleDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Active tab
    const [activeTab, setActiveTab] = useState<TabType>("permissions");

    // Users state
    const [users, setUsers] = useState<RoleUser[]>([]);
    const [usersMeta, setUsersMeta] = useState<PaginationMeta | null>(null);
    const [usersPage, setUsersPage] = useState(1);
    const [usersSearch, setUsersSearch] = useState("");
    const [usersSearchInput, setUsersSearchInput] = useState("");
    const [isUsersLoading, setIsUsersLoading] = useState(false);

    // Permissions pagination (client-side)
    const [permissionsPage, setPermissionsPage] = useState(1);
    const permissionsPerPage = 24;

    // Permissions
    const canUpdate = hasPermission("role.update");
    const canViewUser = hasPermission("user.view");

    // Modal
    const editModal = useModal();

    // Fetch role details
    useEffect(() => {
        const fetchRole = async () => {
            if (!roleId) return;

            setIsLoading(true);
            setError(null);
            const result = await RoleManager.getById(roleId);
            if (result.success && result.data) {
                setRole(result.data.data);
            } else {
                setError(result.error || t("errors.generic"));
            }
            setIsLoading(false);
        };

        fetchRole();
    }, [roleId, t]);

    // Fetch users
    const fetchUsers = useCallback(async (page: number, search?: string) => {
        if (!roleId) return;

        setIsUsersLoading(true);
        const result = await RoleManager.getUsers(roleId, page, search);
        if (result.success && result.data) {
            setUsers(result.data.data);
            setUsersMeta(result.data.meta);
        }
        setIsUsersLoading(false);
    }, [roleId]);

    // Load data when tab changes
    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers(usersPage, usersSearch);
        }
    }, [activeTab, usersPage, usersSearch, fetchUsers]);

    // Debounced search for users
    useEffect(() => {
        const timer = setTimeout(() => {
            if (usersSearchInput !== usersSearch) {
                setUsersSearch(usersSearchInput);
                setUsersPage(1);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [usersSearchInput, usersSearch]);

    // Paginated permissions (client-side)
    const paginatedPermissions = useMemo(() => {
        if (!role?.permissions) return [];
        const start = (permissionsPage - 1) * permissionsPerPage;
        const end = start + permissionsPerPage;
        return role.permissions.slice(start, end);
    }, [role?.permissions, permissionsPage, permissionsPerPage]);

    const permissionsMeta: PaginationMeta | null = useMemo(() => {
        if (!role?.permissions) return null;
        const total = role.permissions.length;
        const lastPage = Math.ceil(total / permissionsPerPage);
        return {
            current_page: permissionsPage,
            last_page: lastPage,
            per_page: permissionsPerPage,
            total,
            from: (permissionsPage - 1) * permissionsPerPage + 1,
            to: Math.min(permissionsPage * permissionsPerPage, total),
        };
    }, [role?.permissions, permissionsPage, permissionsPerPage]);

    const handleUpdateSuccess = async () => {
        // Reload role details
        const result = await RoleManager.getById(roleId);
        if (result.success && result.data) {
            setRole(result.data.data);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
        );
    }

    // Error state
    if (error || !role) {
        return (
            <NotFoundContent
                title={t("roles.notFound")}
                message={t("roles.notFoundMessage")}
                backTo="/roles"
                backLabel={t("roles.backToList")}
            />
        );
    }

    const tabs = [
        { id: "permissions" as TabType, label: t("roles.permissionsTab"), icon: FaKey, count: role.permissions_count },
        { id: "users" as TabType, label: t("roles.usersTab"), icon: FaUsers, count: role.users_count },
    ];

    return (
        <>
            <PageMeta
                title={`${role.name} | ${t("roles.title")} | XetaSuite`}
                description={t("roles.description")}
            />
            <PageBreadcrumb
                pageTitle={role.name}
                breadcrumbs={[
                    { label: t("roles.title"), path: "/roles" },
                    { label: role.name },
                ]}
            />

            {/* Header with actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/roles"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-white/5 dark:text-gray-400 dark:hover:bg-neutral-800"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                                <FaShield className="h-6 w-6 text-brand-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                    {role.name}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("roles.guardName")}: {role.guard_name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {canUpdate && (
                    <Button
                        variant="outline"
                        size="sm"
                        startIcon={<FaPenToSquare className="h-4 w-4" />}
                        onClick={() => editModal.openModal()}
                    >
                        {t("common.edit")}
                    </Button>
                )}
            </div>

            {/* Role Info Card */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/5 dark:bg-white/3">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Permissions Count */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                            <FaKey className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("roles.permissions")}
                            </p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                {role.permissions_count}
                            </p>
                        </div>
                    </div>

                    {/* Users Count */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
                            <FaUsers className="h-5 w-5 text-success-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("roles.users")}
                            </p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                {role.users_count}
                            </p>
                        </div>
                    </div>

                    {/* Created At */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800">
                            <FaCalendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("common.createdAt")}
                            </p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {formatDate(role.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Updated At */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800">
                            <FaCalendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("common.updatedAt")}
                            </p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {role.updated_at ? formatDate(role.updated_at) : "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 dark:border-white/5">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors ${isActive
                                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <Badge variant="light" color={isActive ? "brand" : "light"}>
                                        {tab.count}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Permissions Tab */}
                    {activeTab === "permissions" && (
                        <div>
                            {role.permissions && role.permissions.length > 0 ? (
                                <>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {paginatedPermissions.map((permission) => {
                                            // Get permission description from translation
                                            const parts = permission.name.split(".");
                                            const descriptionKey = parts.length === 2
                                                ? `roles.permissionDescriptions.${parts[0]}.${parts[1]}`
                                                : null;
                                            const description = descriptionKey ? t(descriptionKey) : null;
                                            const hasDescription = description && description !== descriptionKey;

                                            return (
                                                <div
                                                    key={permission.id}
                                                    title={hasDescription ? description : permission.name}
                                                    className="group relative flex flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-white/5 dark:bg-neutral-800/50 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FaKey className="h-3 w-3 shrink-0 text-brand-500" />
                                                        <span className="truncate font-mono text-xs font-medium text-gray-800 dark:text-gray-200">
                                                            {permission.name}
                                                        </span>
                                                    </div>
                                                    {hasDescription && (
                                                        <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                                                            {description}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Permissions Pagination */}
                                    {permissionsMeta && permissionsMeta.last_page > 1 && (
                                        <div className="mt-4">
                                            <Pagination
                                                meta={permissionsMeta}
                                                onPageChange={setPermissionsPage}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    {t("roles.noPermissions")}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div>
                            {/* Search Input */}
                            <div className="mb-4">
                                <div className="relative max-w-sm">
                                    <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder={t('common.search')}
                                        value={usersSearchInput}
                                        onChange={(e) => setUsersSearchInput(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-white/5 dark:bg-white/3 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    />
                                    {usersSearchInput && (
                                        <button
                                            onClick={() => setUsersSearchInput('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            title={t('common.clearSearch')}
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
                            </div>

                            {isUsersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                                </div>
                            ) : users.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200 dark:border-white/5">
                                                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t("common.user")}
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t("users.email")}
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t("common.site")}
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id} className="border-b border-gray-100 dark:border-white/5">
                                                    <TableCell className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {user.avatar && (
                                                                <Avatar
                                                                    src={user.avatar}
                                                                    alt={`${user.first_name} ${user.last_name}`}
                                                                    size="small"
                                                                />
                                                            )}
                                                            <LinkedName
                                                                canView={canViewUser}
                                                                id={user.id}
                                                                name={user.full_name}
                                                                basePath="users" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                        {user.site?.name || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {usersMeta && usersMeta.last_page > 1 && (
                                        <div className="mt-4">
                                            <Pagination
                                                meta={usersMeta}
                                                onPageChange={setUsersPage}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    {usersSearch ? t("common.noSearchResults") : t("roles.noUsers")}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {role && (
                <RoleModal
                    isOpen={editModal.isOpen}
                    onClose={editModal.closeModal}
                    onSuccess={handleUpdateSuccess}
                    role={role}
                />
            )}
        </>
    );
};

export default RoleDetailPage;
