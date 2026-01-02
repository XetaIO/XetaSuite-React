import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    LinkedName,
    ActionsDropdown,
    createActions,
    SortableTableHeader,
    StaticTableHeader,
    Button,
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
import { CompanyManager } from "../services";
import { CompanyModal } from "./CompanyModal";
import type { Company, CompanyFilters } from "../types";

const CompanyListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: companies,
        meta,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        handleSort,
        renderSortIcon,
        handlePageChange,
        refresh,
    } = useListPage<Company, CompanyFilters>({
        fetchFn: CompanyManager.getAll,
    });

    // Selected company for edit/delete
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions - HQ only for companies
    const permissions = useEntityPermissions("company", { hasPermission, isOnHeadquarters }, { hqOnly: true });
    const canViewCreator = isOnHeadquarters && hasPermission("user.view");

    // Modals
    const companyModal = useModal();
    const deleteModal = useModal();

    const handleCreate = () => {
        setSelectedCompany(null);
        companyModal.openModal();
    };

    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        companyModal.openModal();
    };

    const handleDeleteClick = (company: Company) => {
        setSelectedCompany(company);
        deleteModal.openModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCompany) return;

        setIsDeleting(true);
        const result = await CompanyManager.delete(selectedCompany.id);
        if (result.success) {
            showSuccess(t("companies.messages.deleted", { name: selectedCompany.name }));
            setSelectedCompany(null);
            refresh();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
        deleteModal.closeModal();
    };

    const handleModalSuccess = () => {
        refresh();
    };

    const getCompanyActions = (company: Company) => [
        { ...createActions.edit(() => handleEdit(company), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(company), t), hidden: !permissions.canDelete },
    ];

    const skeletonCells = [
        { width: "w-32" },
        { width: "w-48" },
        { width: "w-8", center: true },
        { width: "w-28" },
        { width: "w-24" },
        ...(permissions.hasAnyAction ? [{ width: "w-16", right: true }] : []),
    ];
    const colSpan = 5 + (permissions.hasAnyAction ? 1 : 0);

    return (
        <>
            <PageMeta title={`${t("companies.title")} | XetaSuite`} description={t("companies.description")} />
            <PageBreadcrumb
                pageTitle={t("companies.title")}
                breadcrumbs={[{ label: t("companies.title") }]}
            />

            <ListPageCard>
                <ListPageHeader
                    title={t("companies.listTitle")}
                    description={t("companies.manageCompaniesAndTheirInformation")}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t("companies.create")}
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
                                    field="name"
                                    label={t("common.name")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t("common.description")} />
                                <SortableTableHeader
                                    field="maintenances_count"
                                    label={t("companies.maintenances")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <StaticTableHeader label={t("common.creator")} />
                                <SortableTableHeader
                                    field="created_at"
                                    label={t("common.createdAt")}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                {permissions.hasAnyAction && (
                                    <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t("common.actions")}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows
                                    count={6}
                                    cells={skeletonCells}
                                />
                            ) : companies.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={colSpan}
                                    searchQuery={debouncedSearch}
                                    onClearSearch={() => setSearchQuery("")}
                                    emptyMessage={t("companies.noCompanies")}
                                    noResultsMessage={t("companies.noCompaniesFor", { search: debouncedSearch })}
                                />
                            ) : (
                                companies.map((company) => (
                                    <TableRow key={company.id} className="table-row-hover">
                                        <TableCell className="px-6 py-4">
                                            <LinkedName
                                                canView={permissions.canView}
                                                id={company.id}
                                                name={company.name}
                                                basePath="companies" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {company.description ? (
                                                <span className="line-clamp-1">{company.description}</span>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                                {company.maintenance_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <LinkedName
                                                canView={canViewCreator}
                                                id={company.creator?.id}
                                                name={company.creator?.full_name}
                                                basePath="users" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(company.created_at)}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <ActionsDropdown actions={getCompanyActions(company)} />
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

            {/* Create/Edit Modal */}
            <CompanyModal
                isOpen={companyModal.isOpen}
                onClose={companyModal.closeModal}
                company={selectedCompany}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title={t("companies.deleteTitle")}
                message={t("common.confirmDelete", { name: selectedCompany?.name })}
            />
        </>
    );
};

export default CompanyListPage;
