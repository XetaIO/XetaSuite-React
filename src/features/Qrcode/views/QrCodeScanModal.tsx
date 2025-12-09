/**
 * QR Code Scan Modal
 * Displays when a user scans a QR code and arrives with ?source=qr&material=X or ?source=qr&item=X
 */

import { useState, useEffect, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FaWrench, FaCubes, FaSpinner, FaTriangleExclamation } from 'react-icons/fa6';
import { Modal, Button } from '@/shared/components/ui';
import { useAuth } from '@/features/Auth';
import { QrScanManager } from '@/features/Qrcode/services';
import type { QrScanData, QrScanMaterialData, QrScanItemData } from '@/features/Qrcode/types';

interface QrCodeScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    scanType: 'material' | 'item';
    scanId: number;
}

type ActionOption = {
    value: string;
    label: string;
};

export const QrCodeScanModal: FC<QrCodeScanModalProps> = ({
    isOpen,
    onClose,
    scanType,
    scanId,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, switchSite } = useAuth();

    const [scanData, setScanData] = useState<QrScanData | null>(null);
    const [isSwitchingSite, setIsSwitchingSite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<string>('');

    const loadScanData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = scanType === 'material'
            ? await QrScanManager.getMaterial(scanId)
            : await QrScanManager.getItem(scanId);

        if (result.success && result.data) {
            setScanData(result.data);
        } else {
            setError(result.error || t('errors.generic'));
        }

        setIsLoading(false);
    }, [scanType, scanId, t]);

    useEffect(() => {
        if (isOpen && scanId) {
            loadScanData();
        }
    }, [isOpen, scanId, loadScanData]);

    const getActionOptions = (): ActionOption[] => {
        if (!scanData) return [];

        if (scanData.type === 'material') {
            const materialData = scanData as QrScanMaterialData;
            const options: ActionOption[] = [];

            if (materialData.available_actions.includes('incident')) {
                options.push({ value: 'incident', label: t('qrScan.actions.incident') });
            }
            if (materialData.available_actions.includes('maintenance')) {
                options.push({ value: 'maintenance', label: t('qrScan.actions.maintenance') });
            }
            if (materialData.available_actions.includes('cleaning')) {
                options.push({ value: 'cleaning', label: t('qrScan.actions.cleaning') });
            }

            return options;
        } else {
            const itemData = scanData as QrScanItemData;
            const options: ActionOption[] = [];

            if (itemData.available_actions.includes('entry')) {
                options.push({ value: 'entry', label: t('qrScan.actions.entry') });
            }
            if (itemData.available_actions.includes('exit')) {
                options.push({ value: 'exit', label: t('qrScan.actions.exit') });
            }

            return options;
        }
    };

    const handleSubmit = async () => {
        if (!selectedAction || !scanData) return;

        // Check if we need to switch site
        const entitySiteId = scanData.site?.id;
        const userCurrentSiteId = user?.current_site_id;

        if (entitySiteId && userCurrentSiteId && entitySiteId !== userCurrentSiteId) {
            setIsSwitchingSite(true);
            try {
                await switchSite(entitySiteId);
            } catch (error) {
                console.error('Failed to switch site:', error);
                setIsSwitchingSite(false);
                return;
            }
            setIsSwitchingSite(false);
        }

        // Navigate to the appropriate page/modal based on action
        if (scanData.type === 'material') {
            if (selectedAction === 'incident') {
                navigate(`/incidents?material=${scanData.id}&action=create`);
            } else if (selectedAction === 'maintenance') {
                navigate(`/maintenances?material=${scanData.id}&action=create`);
            } else if (selectedAction === 'cleaning') {
                navigate(`/cleanings?material=${scanData.id}&action=create`);
            }
        } else {
            navigate(`/items/${scanData.id}/?action=${selectedAction}`);
        }

        // Note: Don't call onClose() here - navigation will unmount the component
        // and calling onClose triggers setSearchParams which interferes with navigate
    };

    const actionOptions = getActionOptions();

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                {/* Header */}
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
                    {t('qrScan.title')}
                </h3>

                {isLoading || isSwitchingSite ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <FaSpinner className="h-8 w-8 animate-spin text-brand-500" />
                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                            {isSwitchingSite ? t('qrScan.switchingSite') : t('common.loading')}
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FaTriangleExclamation className="h-12 w-12 text-error-500" />
                        <p className="mt-4 text-error-600 dark:text-error-400">{error}</p>
                        <Button variant="outline" size="sm" onClick={onClose} className="mt-4">
                            {t('common.close')}
                        </Button>
                    </div>
                ) : scanData ? (
                    <div className="space-y-6">
                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {scanData.type === 'material'
                                ? t('qrScan.materialDescription')
                                : t('qrScan.itemDescription')}
                        </p>

                        {/* Entity Icon and Name */}
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                                {scanData.type === 'material' ? (
                                    <FaWrench className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <FaCubes className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                )}
                            </div>
                            <h4 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                {scanData.name}
                            </h4>
                            {scanData.type === 'item' && (scanData as QrScanItemData).reference && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {(scanData as QrScanItemData).reference}
                                </p>
                            )}
                        </div>

                        {/* Site Info */}
                        {scanData.site && (
                            <div className="flex flex-col items-center text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('qrScan.site')}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                                        <span className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                                            {scanData.site.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {scanData.site.name}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Selector */}
                        {actionOptions.length > 0 ? (
                            <div className="space-y-2">
                                <label htmlFor="qr-action-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('qrScan.actionLabel')}
                                </label>
                                <select
                                    id="qr-action-select"
                                    value={selectedAction}
                                    onChange={(e) => setSelectedAction(e.target.value)}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                >
                                    <option value="">{t('qrScan.selectAction')}</option>
                                    {actionOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-warning-50 p-4 text-center dark:bg-warning-500/10">
                                <p className="text-sm text-warning-700 dark:text-warning-400">
                                    {t('qrScan.noActionsAvailable')}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={onClose}>
                                {t('common.cancel')}
                            </Button>
                            {actionOptions.length > 0 && (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!selectedAction || isSwitchingSite}
                                >
                                    {t('common.confirm')}
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </Modal>
    );
};
