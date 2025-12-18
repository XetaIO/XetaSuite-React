import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    FaArrowLeft,
    FaPenToSquare,
    FaTrash,
    FaTriangleExclamation,
    FaCalendar,
    FaCalendarCheck,
    FaUser,
    FaCircleInfo,
    FaScrewdriverWrench,
    FaBuilding,
    FaWrench,
    FaSignsPost,
} from 'react-icons/fa6';
import { IncidentManager } from '../services/IncidentManager';
import { IncidentModal } from './IncidentModal';
import type { IncidentDetail } from '../types';
import { PageMeta, PageBreadcrumb, DeleteConfirmModal } from '@/shared/components/common';
import { Button, Badge, Alert, LinkedName } from '@/shared/components/ui';
import { useModal } from '@/shared/hooks';
import { useAuth } from '@/features/Auth/hooks';
import { formatDate } from '@/shared/utils';
import { showSuccess, showError } from '@/shared/utils';
import { NotFoundContent } from '@/shared/components/errors';

// Badge color mapping for status
const statusColors: Record<string, 'error' | 'warning' | 'success' | 'dark'> = {
    open: 'error',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'dark',
};

// Badge color mapping for severity
const severityColors: Record<string, 'dark' | 'brand' | 'warning' | 'error'> = {
    low: 'dark',
    medium: 'brand',
    high: 'warning',
    critical: 'error',
};

// Badge color mapping for maintenance status
const maintenanceStatusColors: Record<string, 'warning' | 'brand' | 'success' | 'dark'> = {
    planned: 'warning',
    in_progress: 'brand',
    completed: 'success',
    canceled: 'dark',
};

export function IncidentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Incident state
    const [incident, setIncident] = useState<IncidentDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Delete state
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();

    // Permissions
    const canUpdate = !isOnHeadquarters && hasPermission('incident.update');
    const canDelete = !isOnHeadquarters && hasPermission('incident.delete');
    const canViewReporterAndEditor = isOnHeadquarters && hasPermission('user.view');
    const canViewMaintenance = hasPermission('maintenance.view');
    const canViewMaterial = hasPermission('material.view');
    const canViewSite = isOnHeadquarters && hasPermission('site.view');

    // Load incident details
    const loadIncident = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        const result = await IncidentManager.getById(parseInt(id));

        if (result.success && result.data) {
            setIncident(result.data.data);
        } else {
            setError(result.error || t('incidents.errors.loadFailed'));
        }

        setIsLoading(false);
    }, [id, t]);

    // Initial load
    useEffect(() => {
        loadIncident();
    }, [loadIncident]);

    // Handle delete
    const handleDelete = async () => {
        if (!incident) return;

        setIsDeleting(true);
        setDeleteError(null);

        const result = await IncidentManager.delete(incident.id);

        if (result.success) {
            showSuccess(t('incidents.messages.deleted'));
            navigate('/incidents');
        } else {
            setDeleteError(result.error || t('common.error'));
            showError(result.error || t('common.error'));
        }

        setIsDeleting(false);
        deleteModal.closeModal();
    };

    // Handle edit success
    const handleEditSuccess = () => {
        editModal.closeModal();
        loadIncident();
    };

    // Loading state
    if (isLoading) {
        return (
            <>
                <PageMeta title={t('incidents.title')} description={t('incidents.description')} />
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
            </>
        );
    }

    // Error state
    if (error || !incident) {
        return (
            <>
                <PageMeta title={t('incidents.title')} description={t('incidents.description')} />
                <NotFoundContent
                    title={t('common.notFound')}
                    message={error || t('incidents.errors.notFound')}
                    backTo="/incidents"
                    backLabel={t('incidents.title')}
                />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`${t('incidents.title')} #${incident.id}`}
                description={incident.description}
            />

            <PageBreadcrumb
                pageTitle={`${t('incidents.title')} #${incident.id}`}
                breadcrumbs={[
                    { label: t('incidents.title'), path: '/incidents' },
                    { label: `#${incident.id}` },
                ]}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Link
                            to="/incidents"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        >
                            <FaArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <FaTriangleExclamation className="h-6 w-6 text-warning-500" />
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {t('incidents.title')} #{incident.id}
                                </h1>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge color={severityColors[incident.severity] || 'dark'} size="md">
                                    {incident.severity_label}
                                </Badge>
                                <Badge color={statusColors[incident.status] || 'dark'} size="md">
                                    {incident.status_label}
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
                                {incident.description}
                            </p>
                        </div>

                        {/* Material Card */}
                        {incident.material && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                    <FaWrench className="h-5 w-5 text-brand-500" />
                                    {t('incidents.material')}
                                </h2>
                                {canViewMaterial ? (
                                    <Link
                                        to={`/materials/${incident.material.id}`}
                                        className="block rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-900/20"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {incident.material.name}
                                                </p>
                                                {incident.material.zone && (
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <FaSignsPost className="h-3 w-3" />
                                                        {incident.material.zone.name}
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
                                                {incident.material.name}
                                            </p>
                                            {incident.material.zone && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <FaSignsPost className="h-3 w-3" />
                                                    {incident.material.zone.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Maintenance Card (if linked) */}
                        {incident.maintenance && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                    <FaScrewdriverWrench className="h-5 w-5 text-brand-500" />
                                    {t('incidents.linkedToMaintenance')}
                                </h2>
                                {canViewMaintenance ? (
                                    <Link
                                        to={`/maintenances/${incident.maintenance.id}`}
                                        className="block rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-900/20"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {t('incidents.maintenance')} #{incident.maintenance.id}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {incident.maintenance.description}
                                                </p>
                                                {incident.maintenance.status && (
                                                    <div className="mt-2">
                                                        <Badge
                                                            color={maintenanceStatusColors[incident.maintenance.status] || 'dark'}
                                                            size="sm"
                                                        >
                                                            {incident.maintenance.status}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <FaArrowLeft className="h-4 w-4 rotate-180 text-gray-400 shrink-0 ml-4" />
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-center justify-between rounded-lg border  border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 p-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {t('incidents.maintenance')} #{incident.maintenance.id}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {incident.maintenance.description}
                                            </p>
                                            {incident.maintenance.status && (
                                                <div className="mt-2">
                                                    <Badge
                                                        color={maintenanceStatusColors[incident.maintenance.status] || 'dark'}
                                                        size="sm"
                                                    >
                                                        {incident.maintenance.status}
                                                    </Badge>
                                                </div>
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
                                <div className="flex items-start gap-3">
                                    <FaBuilding className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('common.site')}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            <LinkedName
                                                canView={canViewSite}
                                                id={incident.site?.id}
                                                name={incident.site?.name}
                                                basePath="sites" />
                                        </p>
                                    </div>
                                </div>
                                {/* Reporter */}
                                <div className="flex items-start gap-3">
                                    <FaUser className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('incidents.reportedBy')}
                                        </p>
                                        <LinkedName
                                            canView={canViewReporterAndEditor}
                                            id={incident.reporter?.id}
                                            name={incident.reporter?.full_name || incident.reported_by_name}
                                            basePath="users" />
                                    </div>
                                </div>

                                {/* Started At */}
                                <div className="flex items-start gap-3">
                                    <FaCalendar className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('incidents.startedAt')}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {incident.started_at ? formatDate(incident.started_at) : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Resolved At */}
                                {(incident.status === 'resolved' || incident.status === 'closed') && (
                                    <div className="flex items-start gap-3">
                                        <FaCalendarCheck className="mt-0.5 h-4 w-4 text-success-500" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t('incidents.resolvedAt')}
                                            </p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {incident.resolved_at ? formatDate(incident.resolved_at) : '—'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timestamps Card */}
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
                                        {formatDate(incident.created_at)}
                                    </p>
                                </div>

                                {/* Updated At */}
                                {incident.updated_at && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('common.updatedAt')}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(incident.updated_at)}
                                        </p>
                                    </div>
                                )}

                                {/* Edited By */}
                                {incident.editor && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('common.editedBy')}
                                        </p>
                                        <LinkedName
                                            canView={canViewReporterAndEditor}
                                            id={incident.editor.id}
                                            name={incident.editor.full_name}
                                            basePath="users" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <IncidentModal
                isOpen={editModal.isOpen}
                onClose={editModal.closeModal}
                incident={incident}
                onSuccess={handleEditSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title={t('incidents.deleteTitle')}
                message={t('incidents.confirmDelete')}
            />
        </>
    );
}

export default IncidentDetailPage;
