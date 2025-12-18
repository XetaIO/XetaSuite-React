import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaArrowLeft,
    FaBroom,
    FaCalendar,
    FaPenToSquare,
    FaTrash,
    FaBuilding,
    FaCircleInfo,
    FaUser,
    FaWrench,
    FaSignsPost,
} from 'react-icons/fa6';
import { CleaningManager } from '../services/CleaningManager';
import { CleaningModal } from './CleaningModal';
import type { CleaningDetail } from '../types';
import { PageMeta, PageBreadcrumb, DeleteConfirmModal } from '@/shared/components/common';
import { Button, Badge, Alert, LinkedName } from '@/shared/components/ui';
import { useModal } from '@/shared/hooks';
import { useAuth } from '@/features/Auth/hooks';
import { formatDate, showSuccess, showError } from '@/shared/utils';
import { NotFoundContent } from '@/shared/components/errors';

export function CleaningDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Cleaning state
    const [cleaning, setCleaning] = useState<CleaningDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Delete state
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();

    // Permissions
    const canUpdate = !isOnHeadquarters && hasPermission('cleaning.update');
    const canDelete = !isOnHeadquarters && hasPermission('cleaning.delete');
    const canViewSites = hasPermission('site.view');
    const canViewMaterials = hasPermission('material.view');
    const canViewCreatorAndEditor = hasPermission('user.view');

    // Load cleaning details
    const loadCleaning = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        const result = await CleaningManager.getById(Number(id));

        if (result.success && result.data) {
            setCleaning(result.data.data);
        } else {
            setError(result.error || t('cleanings.errors.loadFailed'));
        }

        setIsLoading(false);
    }, [id, t]);

    // Initial load
    useEffect(() => {
        loadCleaning();
    }, [loadCleaning]);

    // Handle edit success
    const handleEditSuccess = async () => {
        editModal.closeModal();
        await loadCleaning();
    };

    // Handle delete
    const handleDelete = async () => {
        if (!cleaning) return;

        setIsDeleting(true);
        setDeleteError(null);

        const result = await CleaningManager.delete(cleaning.id);

        if (result.success) {
            showSuccess(t('cleanings.messages.deleted'));
            navigate('/cleanings', { replace: true });
        } else {
            setDeleteError(result.error || t('common.error'));
            showError(result.error || t('common.error'));
        }

        setIsDeleting(false);
        deleteModal.closeModal();
    };

    // Loading state
    if (isLoading) {
        return (
            <>
                <PageMeta title={t('cleanings.title')} description={t('cleanings.description')} />
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
            </>
        );
    }

    // Error state
    if (error || !cleaning) {
        return (
            <>
                <PageMeta title={t('cleanings.title')} description={t('cleanings.description')} />
                <NotFoundContent
                    title={t('common.notFound')}
                    message={error || t('cleanings.errors.notFound')}
                    backTo="/cleanings"
                    backLabel={t('cleanings.title')}
                />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`${t('cleanings.cleaning')} #${cleaning.id} | XetaSuite`}
                description={cleaning.description || t('cleanings.description')}
            />

            <PageBreadcrumb
                pageTitle={`${t('cleanings.cleaning')} #${cleaning.id}`}
                breadcrumbs={[
                    { label: t('cleanings.title'), path: '/cleanings' },
                    { label: `#${cleaning.id}` },
                ]}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Link
                            to="/cleanings"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        >
                            <FaArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <FaBroom className="h-6 w-6 text-success-500" />
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {t('cleanings.cleaning')} #{cleaning.id}
                                </h1>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge color="success" size="md">
                                    {cleaning.type_label}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {(canUpdate || canDelete) && (
                        <div className="flex gap-2">
                            {canUpdate && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={editModal.openModal}
                                >
                                    <FaPenToSquare className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={deleteModal.openModal}
                                    className="text-error-600 hover:bg-error-50 hover:text-error-700 dark:text-error-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
                                >
                                    <FaTrash className="mr-2 h-4 w-4" />
                                    {t('common.delete')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Delete error */}
                {deleteError && (
                    <Alert variant="error" title={t('common.error')} message={deleteError} />
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Info - Left Column (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                <FaCircleInfo className="h-5 w-5 text-brand-500" />
                                {t('common.description')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {cleaning.description || (
                                    <span className="italic text-gray-400">
                                        {t('cleanings.noDescription')}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Material Card */}
                        {cleaning.material && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                    <FaWrench className="h-5 w-5 text-brand-500" />
                                    {t('cleanings.material')}
                                </h2>
                                {canViewMaterials ? (
                                    <Link
                                        to={`/materials/${cleaning.material.id}`}
                                        className="block rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-900/20"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {cleaning.material.name}
                                                </p>
                                                {cleaning.material.zone && (
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <FaSignsPost className="h-3 w-3" />
                                                        {cleaning.material.zone.name}
                                                    </p>
                                                )}
                                            </div>
                                            <FaArrowLeft className="h-4 w-4 rotate-180 text-gray-400" />
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-center justify-between rounded-lg border  border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 p-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {cleaning.material.name}
                                            </p>
                                            {cleaning.material.zone && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <FaSignsPost className="h-3 w-3" />
                                                    {cleaning.material.zone.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        {/* Details Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                {t('common.details')}
                            </h2>
                            <div className="space-y-4">
                                {/* Site */}
                                {cleaning.site && (
                                    <div className="flex items-start gap-3">
                                        <FaBuilding className="mt-0.5 h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t('common.site')}
                                            </p>
                                            <LinkedName
                                                canView={canViewSites}
                                                id={cleaning.site.id}
                                                name={cleaning.site.name}
                                                basePath="sites" />
                                        </div>
                                    </div>
                                )}

                                {/* Type */}
                                <div className="flex items-start gap-3">
                                    <FaBroom className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('cleanings.type')}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {cleaning.type_label}
                                        </p>
                                    </div>
                                </div>

                                {/* Created By */}
                                <div className="flex items-start gap-3">
                                    <FaUser className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('cleanings.createdBy')}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            <LinkedName
                                                canView={canViewCreatorAndEditor}
                                                id={cleaning?.creator?.id}
                                                name={cleaning?.creator?.full_name || cleaning.created_by_name}
                                                basePath="users" />
                                        </p>
                                    </div>
                                </div>

                                {/* Created At */}
                                <div className="flex items-start gap-3">
                                    <FaCalendar className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('common.createdAt')}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(cleaning.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                {t('common.history')}
                            </h2>
                            <div className="space-y-4">
                                {/* Created At */}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t('common.createdAt')}
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(cleaning.created_at)}
                                    </p>
                                </div>

                                {/* Updated At */}
                                {cleaning.updated_at && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('common.updatedAt')}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(cleaning.updated_at)}
                                        </p>
                                    </div>
                                )}

                                {/* Edited By */}
                                {cleaning.editor && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('common.editedBy')}
                                        </p>
                                        <LinkedName
                                            canView={canViewCreatorAndEditor}
                                            id={cleaning?.editor?.id}
                                            name={cleaning?.editor?.full_name}
                                            basePath="users" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Edit Modal */}
            < CleaningModal
                isOpen={editModal.isOpen}
                onClose={editModal.closeModal}
                cleaning={cleaning}
                onSuccess={handleEditSuccess}
            />

            {/* Delete Confirmation Modal */}
            < DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title={t('cleanings.deleteTitle')}
                message={t('cleanings.confirmDelete')}
            />
        </>
    );
}

export default CleaningDetailPage;
