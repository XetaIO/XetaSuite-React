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

    // Skeleton and empty state config
    const skeletonCells = [
        { width: "w-32" },
        { width: "w-8", center: true as const },
        { width: "w-24" },
        ...(permissionChecks.hasAnyAction ? [{ width: "w-8", right: true as const }] : []),
    ];
    const colSpan = 3 + (permissionChecks.hasAnyAction ? 1 : 0);

    return (
        <>
            <PageMeta
                title={`${t("permissions.title")} | XetaSuite`}
                description={t("permissions.description")}
            />
            <PageBreadcrumb pageTitle={t("permissions.title")} />

            <ListPageCard>
                <ListPageHeader
                    title={t("permissions.listTitle")}
                    description={t("permissions.managePermissions")}
                    actions={
                        permissionChecks.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={() => createModal.openModal()}
                            >
                                {t("permissions.create")}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder={t("permissions.searchPlaceholder")}
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
                                <TableSkeletonRows count={6} cells={skeletonCells} />
                            ) : permissions.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch}
                                    onClearSearch={() => setSearchQuery("")}
                                    emptyMessage={t("permissions.noPermissions")}
                                />
                            ) : (
                                permissions.map((permission) => (
                                    <TableRow key={permission.id} className="table-row-hover">
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
            </ListPageCard>

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
