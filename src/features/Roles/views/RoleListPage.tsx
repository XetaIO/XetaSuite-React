import { useState, type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaPlus,
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
import { RoleManager } from "../services";
import { RoleModal } from "./RoleModal";
import type { Role, RoleDetail, RoleFilters } from "../types";

const RoleListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

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
    const permissions = useEntityPermissions("role", { hasPermission, isOnHeadquarters }, { hqOnly: true });

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

    // Skeleton and empty state config
    const skeletonCells = [
        { width: "w-32" },
        { width: "w-8", center: true as const },
        { width: "w-8", center: true as const },
        { width: "w-24" },
        ...(permissions.hasAnyAction ? [{ width: "w-8", right: true as const }] : []),
    ];
    const colSpan = 4 + (permissions.hasAnyAction ? 1 : 0);

    return (
        <>
            <PageMeta
                title={`${t("roles.title")} | XetaSuite`}
                description={t("roles.description")}
            />
            <PageBreadcrumb pageTitle={t("roles.title")} />

            <ListPageCard>
                <ListPageHeader
                    title={t("roles.listTitle")}
                    description={t("roles.manageRolesAndPermissions")}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={() => createModal.openModal()}
                            >
                                {t("roles.create")}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder={t("roles.searchPlaceholder")}
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                <SortableTableHeader
                                    field="name"
                                    label={t("roles.name")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <SortableTableHeader
                                    field="permissions_count"
                                    label={t("roles.permissions")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="users_count"
                                    label={t("roles.users")}
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
                                {permissions.hasAnyAction && (
                                    <StaticTableHeader label={t("common.actions")} align="right" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows count={6} cells={skeletonCells} />
                            ) : roles.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch}
                                    onClearSearch={() => setSearchQuery("")}
                                    emptyMessage={t("roles.noRoles")}
                                />
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id} className="table-row-hover">
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
            </ListPageCard>

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
