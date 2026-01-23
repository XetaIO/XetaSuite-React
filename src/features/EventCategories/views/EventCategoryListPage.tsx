import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa6';
import { PageMeta, PageBreadcrumb, Pagination, DeleteConfirmModal } from '@/shared/components/common';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
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
} from '@/shared/components/ui';
import { useModal, useListPage, useEntityPermissions } from '@/shared/hooks';
import { showSuccess, showError, formatDate } from '@/shared/utils';
import { useAuth } from '@/features/Auth';
import { EventCategoryManager } from '../services';
import { EventCategoryModal } from './EventCategoryModal';
import type { EventCategory, EventCategoryFilters } from '../types';

const EventCategoryListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Use shared list hook
    const {
        items: categories,
        meta,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        handleSort,
        renderSortIcon,
        handlePageChange,
        refresh,
    } = useListPage<EventCategory, EventCategoryFilters>({
        fetchFn: EventCategoryManager.getAll,
        defaultSortField: 'name',
        defaultSortDirection: 'asc',
    });

    // Selected category for edit/delete
    const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions
    const permissions = useEntityPermissions("eventCategory", { hasPermission, isOnHeadquarters });

    // Modals
    const categoryModal = useModal();
    const deleteModal = useModal();

    // Handle create
    const handleCreate = () => {
        setSelectedCategory(null);
        categoryModal.openModal();
    };

    // Handle edit
    const handleEdit = (category: EventCategory) => {
        setSelectedCategory(category);
        categoryModal.openModal();
    };

    // Handle delete confirm
    const handleDeleteClick = (category: EventCategory) => {
        setSelectedCategory(category);
        deleteModal.openModal();
    };

    // Handle delete
    const handleDelete = async () => {
        if (!selectedCategory) return;

        setIsDeleting(true);
        const result = await EventCategoryManager.delete(selectedCategory.id);
        setIsDeleting(false);

        if (result.success) {
            showSuccess(t('eventCategories.deleted'));
            deleteModal.closeModal();
            setSelectedCategory(null);
            refresh();
        } else {
            showError(result.error || t('common.error'));
        }
    };

    // Handle modal save
    const handleModalSave = () => {
        refresh();
    };

    // Actions generator
    const getActions = (category: EventCategory) => [
        { ...createActions.edit(() => handleEdit(category), t), hidden: !permissions.canUpdate },
        { ...createActions.delete(() => handleDeleteClick(category), t), hidden: !permissions.canDelete },
    ];

    // Skeleton cells config
    const skeletonCells = [
        { width: 'w-16' },
        { width: 'w-32' },
        { width: 'w-16' },
        { width: 'w-16', centered: true },
        { width: 'w-24' },
        { width: 'w-16', right: true },
    ];

    return (
        <>
            <PageMeta
                title={t('eventCategories.pageTitle')}
                description={t('eventCategories.title')}
            />

            <PageBreadcrumb
                pageTitle={t('eventCategories.title')}
                breadcrumbs={[
                    { label: t('sidebar.calendar'), path: '/calendar' },
                    { label: t('eventCategories.title') },
                ]}
            />

            <ListPageCard>
                <ListPageHeader
                    title={t('eventCategories.title')}
                    actions={
                        permissions.canCreate && (
                            <Button
                                variant="primary"
                                size="sm"
                                startIcon={<FaPlus className="h-4 w-4" />}
                                onClick={handleCreate}
                            >
                                {t('eventCategories.create')}
                            </Button>
                        )
                    }
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder={t('eventCategories.searchPlaceholder')}
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="table-header-row-border">
                                <SortableTableHeader
                                    field="name"
                                    label={t('eventCategories.name')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                <StaticTableHeader label={t('eventCategories.description')} />
                                <StaticTableHeader label={t('eventCategories.color')} className="w-20" />
                                <SortableTableHeader
                                    field="calendar_event_count"
                                    label={t('eventCategories.calendarEventCount')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                    align="center"
                                />
                                <SortableTableHeader
                                    field="created_at"
                                    label={t('eventCategories.createdAt')}
                                    onSort={handleSort}
                                    renderSortIcon={renderSortIcon}
                                />
                                {permissions.hasAnyAction && (
                                    <StaticTableHeader label={t('common.actions')} align="right" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeletonRows cells={skeletonCells} />
                            ) : categories.length === 0 ? (
                                <EmptyTableRow
                                    colSpan={6}
                                    searchQuery={searchQuery}
                                    onClearSearch={() => setSearchQuery('')}
                                    emptyMessage={t('eventCategories.empty')}
                                />
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {category.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 max-w-xs truncate text-gray-500 dark:text-gray-400">
                                            {category.description || '-'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full shrink-0"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                                {category.calendar_event_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(category.created_at)}
                                        </TableCell>
                                        {permissions.hasAnyAction && (
                                            <TableCell className="text-right px-6 py-4">
                                                <ActionsDropdown actions={getActions(category)} />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {meta && (
                    <Pagination
                        meta={meta}
                        onPageChange={handlePageChange}
                    />
                )}
            </ListPageCard>

            {/* Create/Edit Modal */}
            <EventCategoryModal
                isOpen={categoryModal.isOpen}
                onClose={categoryModal.closeModal}
                category={selectedCategory}
                onSave={handleModalSave}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title={t('eventCategories.deleteTitle')}
                message={t('eventCategories.deleteMessage', { name: selectedCategory?.name })}
            />
        </>
    );
};

export default EventCategoryListPage;
