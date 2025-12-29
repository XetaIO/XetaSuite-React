import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from "@/shared/components/common";
import { Table, TableHeader, TableBody, TableRow, TableCell, LinkedName, ActionsDropdown, createActions, SortableTableHeader, StaticTableHeader } from "@/shared/components/ui";
import { Button } from "@/shared/components/ui";
import { SearchInput } from "@/shared/components/form";
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
            deleteModal.closeModal();
            setSelectedCompany(null);
            refresh();
        } else {
            deleteModal.closeModal();
            showError(result.error || t("errors.generic"));
        }
        setIsDeleting(false);
    };

    const handleModalSuccess = () => {
        refresh();
    };

    const getCompanyActions = (company: Company) => [
        { ...createActions.edit(() => handleEdit(company), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(company), t), hidden: !permissions.canDelete },
    ];

    return (
        <>
            <PageMeta title={`${t("companies.title")} | XetaSuite`} description={t("companies.description")} />
            <PageBreadcrumb
                pageTitle={t("companies.title")}
                breadcrumbs={[{ label: t("companies.title") }]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("companies.listTitle")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("companies.manageCompaniesAndTheirInformation")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t("companies.create")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card-body-border">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            className="max-w-md flex-1"
                        />
                        {debouncedSearch.length > 0 && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-sm text-brand-500 hover:text-brand-600"
                            >
                                {t("common.clearFilters")}
                            </button>
                        )}
                    </div>
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
                                [...Array(6)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="mx-auto h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="px-6 py-4">
                                                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : companies.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={permissions.hasAnyAction ? 6 : 5}>
                                        {debouncedSearch ? (
                                            <div>
                                                <p>{t("companies.noCompaniesFor", { search: debouncedSearch })}</p>
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t("common.clearSearch")}
                                                </button>
                                            </div>
                                        ) : (
                                            t("companies.noCompanies")
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                companies.map((company) => (
                                    <TableRow
                                        key={company.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
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
            </div>

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
