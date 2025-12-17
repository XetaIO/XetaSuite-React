import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaBroom, FaCalendar, FaPenToSquare, FaTrash, FaBuilding } from 'react-icons/fa6';
import { CleaningManager } from '../services/CleaningManager';
import { CleaningModal } from './CleaningModal';
import type { CleaningDetail } from '../types';
import { PageMeta, PageBreadcrumb, DeleteConfirmModal } from '@/shared/components/common';
import { Button, Badge } from '@/shared/components/ui';
import { useModal } from '@/shared/hooks';
import { useAuth } from '@/features/Auth/hooks';
import { formatDate } from '@/shared/utils';
import { NotFoundContent } from '@/shared/components/errors';

export function CleaningDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hasPermission, isOnHeadquarters } = useAuth();

    const [cleaning, setCleaning] = useState<CleaningDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const editModal = useModal();
    const deleteModal = useModal();
    const [isDeleting, setIsDeleting] = useState(false);

    const canUpdate = hasPermission('cleaning.update');
    const canDelete = hasPermission('cleaning.delete');

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

    useEffect(() => {
        loadCleaning();
    }, [loadCleaning]);

    const handleEditSuccess = async () => {
        editModal.closeModal();
        await loadCleaning();
    };

    const handleDelete = async () => {
        if (!cleaning) return;

        setIsDeleting(true);
        const result = await CleaningManager.delete(cleaning.id);

        if (result.success) {
            deleteModal.closeModal();
            navigate('/cleanings', { replace: true });
        } else {
            setError(result.error || t('cleanings.errors.deleteFailed'));
        }

        setIsDeleting(false);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
            </div>
        );
    }

    if (error || !cleaning) {
        return (
            <>
                <PageMeta title={`${t('errors.notFound')} | XetaSuite`} description={t('errors.pageNotFound')} />
                <NotFoundContent
                    title={t('cleanings.notFound')}
                    message={t('cleanings.notFoundMessage')}
                    backTo="/cleanings"
                    backLabel={t('cleanings.detail.backToList')}
                />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`${t('cleanings.cleaning')} #${cleaning.id} | XetaSuite`}
                description={t('cleanings.description')}
            />
            <PageBreadcrumb
                pageTitle={`${t('cleanings.cleaning')} #${cleaning.id}`}
                breadcrumbs={[
                    { label: t('cleanings.title'), path: '/cleanings' },
                    { label: `#${cleaning.id}` },
                ]}
            />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/cleanings"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            title={t('common.back')}
                        >
                            <FaArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <FaBroom className="h-5 w-5 text-gray-400" />
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {t('cleanings.cleaning')} #{cleaning.id}
                                </h1>
                                <Badge color="brand">{cleaning.type_label}</Badge>
                            </div>
                            {cleaning.material && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    {t('cleanings.forMaterial')}: <Link to={`/materials/${cleaning.material.id}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">{cleaning.material.name}</Link>
                                </p>
                            )}
                            {cleaning.site && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <FaBuilding className="h-3 w-3" />
                                    {t('common.site')}: <span className="text-brand-600">{cleaning.site.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {canUpdate && (
                            <Button
                                variant="outline"
                                size="sm"
                                startIcon={<FaPenToSquare className="h-4 w-4" />}
                                onClick={() => editModal.openModal()}
                            >
                                {t('common.edit')}
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                startIcon={<FaTrash className="h-4 w-4" />}
                                onClick={() => deleteModal.openModal()}
                                className="text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
                            >
                                {t('common.delete')}
                            </Button>
                        )}
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                            {t('cleanings.detail.info')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('cleanings.description')}
                                </p>
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {cleaning.description || <span className="text-gray-400">—</span>}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('cleanings.createdBy')}
                                </p>
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <p className="text-gray-900 dark:text-white">
                                        {cleaning.creator?.full_name || cleaning.created_by_name || <span className="text-gray-400">—</span>}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('cleanings.date')}
                                </p>
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <p className="text-gray-900 dark:text-white">
                                        {formatDate(cleaning.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CleaningModal
                isOpen={editModal.isOpen}
                onClose={editModal.closeModal}
                cleaning={cleaning}
                onSuccess={handleEditSuccess}
            />
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDelete}
                title={t('cleanings.delete')}
                message={t('cleanings.deleteConfirm')}
                isLoading={isDeleting}
            />
        </>
    );
}

export default CleaningDetailPage;
