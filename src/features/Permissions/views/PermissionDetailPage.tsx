import { useState, useEffect, useCallback, type FC } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaArrowLeft,
    FaCalendar,
    FaPenToSquare,
    FaKey,
    FaShield,
    FaMagnifyingGlass,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination } from "@/shared/components/common";
import { Button, Table, TableHeader, TableBody, TableRow, TableCell, Badge, LinkedName } from "@/shared/components/ui";
import { NotFoundContent } from "@/shared/components/errors";
import { useModal } from "@/shared/hooks";
import type { PaginationMeta } from "@/shared/types";
import { formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { PermissionManager } from "../services";
import { PermissionModal } from "./PermissionModal";
import type { PermissionDetail, PermissionRole } from "../types";

const PermissionDetailPage: FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { hasPermission } = useAuth();
    const permissionId = Number(id);

    // Permission state
    const [permission, setPermission] = useState<PermissionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Roles state
    const [roles, setRoles] = useState<PermissionRole[]>([]);
    const [rolesMeta, setRolesMeta] = useState<PaginationMeta | null>(null);
    const [rolesPage, setRolesPage] = useState(1);
    const [rolesSearch, setRolesSearch] = useState("");
    const [rolesSearchInput, setRolesSearchInput] = useState("");
    const [isRolesLoading, setIsRolesLoading] = useState(false);

    // Permissions
    const canUpdate = hasPermission("permission.update");
    const canViewRole = hasPermission("role.view");

    // Modal
    const editModal = useModal();

    // Fetch permission details
    useEffect(() => {
        const fetchPermission = async () => {
            if (!permissionId) return;

            setIsLoading(true);
            setError(null);
            const result = await PermissionManager.getById(permissionId);
            if (result.success && result.data) {
                setPermission(result.data.data);
            } else {
                setError(result.error || t("errors.generic"));
            }
            setIsLoading(false);
        };

        fetchPermission();
    }, [permissionId, t]);

    // Fetch roles
    const fetchRoles = useCallback(async (page: number, search?: string) => {
        if (!permissionId) return;

        setIsRolesLoading(true);
        const result = await PermissionManager.getRoles(permissionId, page, search);
        if (result.success && result.data) {
            setRoles(result.data.data);
            setRolesMeta(result.data.meta);
        }
        setIsRolesLoading(false);
    }, [permissionId]);

    // Load roles initially
    useEffect(() => {
        fetchRoles(rolesPage, rolesSearch);
    }, [rolesPage, rolesSearch, fetchRoles]);

    // Debounced search for roles
    useEffect(() => {
        const timer = setTimeout(() => {
            if (rolesSearchInput !== rolesSearch) {
                setRolesSearch(rolesSearchInput);
                setRolesPage(1);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [rolesSearchInput, rolesSearch]);

    const handleUpdateSuccess = async () => {
        // Reload permission details
        const result = await PermissionManager.getById(permissionId);
        if (result.success && result.data) {
            setPermission(result.data.data);
        }
    };

    // Get permission description from translation
    const getPermissionDescription = (permissionName: string): string | null => {
        const parts = permissionName.split(".");
        if (parts.length !== 2) return null;
        const [resource, action] = parts;
        const key = `roles.permissionDescriptions.${resource}.${action}`;
        const description = t(key);
        return description === key ? null : description;
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
    if (error || !permission) {
        return (
            <NotFoundContent
                title={t("permissions.notFound")}
                message={t("permissions.notFoundMessage")}
                backTo="/permissions"
                backLabel={t("permissions.backToList")}
            />
        );
    }

    const description = getPermissionDescription(permission.name);

    return (
        <>
            <PageMeta
                title={`${permission.name} | ${t("permissions.title")} | XetaSuite`}
                description={t("permissions.description")}
            />
            <PageBreadcrumb
                pageTitle={permission.name}
                breadcrumbs={[
                    { label: t("permissions.title"), path: "/permissions" },
                    { label: permission.name },
                ]}
            />

            {/* Header with actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/permissions"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                                <FaKey className="h-6 w-6 text-brand-500" />
                            </div>
                            <div>
                                <h1 className="font-mono text-xl font-semibold text-gray-800 dark:text-white/90">
                                    {permission.name}
                                </h1>
                                {description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {description}
                                    </p>
                                )}
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

            {/* Permission Info Card */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Roles Count */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                            <FaShield className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("permissions.roles")}
                            </p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                {permission.roles_count}
                            </p>
                        </div>
                    </div>

                    {/* Created At */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <FaCalendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("common.createdAt")}
                            </p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {formatDate(permission.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Updated At */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <FaCalendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("common.updatedAt")}
                            </p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {permission.updated_at ? formatDate(permission.updated_at) : "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles Section */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <FaShield className="h-4 w-4 text-brand-500" />
                    <span className="font-medium text-gray-800 dark:text-white/90">
                        {t("permissions.rolesWithPermission")}
                    </span>
                    <Badge variant="light" color="brand">
                        {permission.roles_count}
                    </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Search Input */}
                    <div className="mb-4">
                        <div className="relative max-w-sm">
                            <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder={t("common.search")}
                                value={rolesSearchInput}
                                onChange={(e) => setRolesSearchInput(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                            {rolesSearchInput && (
                                <button
                                    onClick={() => setRolesSearchInput("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    title={t("common.clearSearch")}
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

                    {isRolesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        </div>
                    ) : roles.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                        <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {t("roles.name")}
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {t("roles.users")}
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {t("common.createdAt")}
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id} className="border-b border-gray-100 dark:border-gray-800">
                                            <TableCell className="px-4 py-3">
                                                <LinkedName
                                                    canView={canViewRole}
                                                    id={role.id}
                                                    name={role.name}
                                                    basePath="roles"
                                                />
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <Badge variant="light" color="info">
                                                    {role.users_count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(role.created_at)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {rolesMeta && rolesMeta.last_page > 1 && (
                                <div className="mt-4">
                                    <Pagination
                                        meta={rolesMeta}
                                        onPageChange={setRolesPage}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                            {rolesSearch ? t("common.noSearchResults") : t("permissions.noRoles")}
                        </p>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {permission && (
                <PermissionModal
                    isOpen={editModal.isOpen}
                    onClose={editModal.closeModal}
                    onSuccess={handleUpdateSuccess}
                    permission={permission}
                />
            )}
        </>
    );
};

export default PermissionDetailPage;
