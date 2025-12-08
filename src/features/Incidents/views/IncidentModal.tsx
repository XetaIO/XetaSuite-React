import { useState, useEffect, useRef, type FC, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';
import { Modal, Button } from '@/shared/components/ui';
import { Label, TextArea } from '@/shared/components/form';
import { showSuccess, showError } from '@/shared/utils';
import { IncidentManager } from '../services';
import type {
    Incident,
    IncidentFormData,
    AvailableMaterial,
    AvailableMaintenance,
    SeverityOption,
    StatusOption,
    IncidentSeverity,
    IncidentStatus,
} from '../types';

interface IncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    incident: Incident | null;
    onSuccess: () => void;
}

const initialFormData: IncidentFormData = {
    material_id: 0,
    maintenance_id: null,
    description: '',
    severity: 'medium',
    status: 'open',
    started_at: null,
    resolved_at: null,
};

export const IncidentModal: FC<IncidentModalProps> = ({ isOpen, onClose, incident, onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<IncidentFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Available options
    const [availableMaterials, setAvailableMaterials] = useState<AvailableMaterial[]>([]);
    const [availableMaintenances, setAvailableMaintenances] = useState<AvailableMaintenance[]>([]);
    const [severityOptions, setSeverityOptions] = useState<SeverityOption[]>([]);
    const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    // Dropdown states
    const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
    const [isMaintenanceDropdownOpen, setIsMaintenanceDropdownOpen] = useState(false);
    const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // Refs for dropdowns
    const materialDropdownRef = useRef<HTMLDivElement>(null);
    const maintenanceDropdownRef = useRef<HTMLDivElement>(null);
    const severityDropdownRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    const isEditing = incident !== null;

    // Load options when modal opens
    useEffect(() => {
        if (isOpen) {
            loadOptions();
        }
    }, [isOpen, incident]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormData);
            setErrors({});
            setIsMaterialDropdownOpen(false);
            setIsMaintenanceDropdownOpen(false);
            setIsSeverityDropdownOpen(false);
            setIsStatusDropdownOpen(false);
        }
    }, [isOpen]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target as Node)) {
                setIsMaterialDropdownOpen(false);
            }
            if (maintenanceDropdownRef.current && !maintenanceDropdownRef.current.contains(event.target as Node)) {
                setIsMaintenanceDropdownOpen(false);
            }
            if (severityDropdownRef.current && !severityDropdownRef.current.contains(event.target as Node)) {
                setIsSeverityDropdownOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load maintenances when material changes
    useEffect(() => {
        if (formData.material_id > 0) {
            loadMaintenances(formData.material_id);
        } else {
            setAvailableMaintenances([]);
            setFormData((prev) => ({ ...prev, maintenance_id: null }));
        }
    }, [formData.material_id]);

    const loadOptions = async () => {
        setIsLoadingOptions(true);

        const [materialsResult, severityResult, statusResult] = await Promise.all([
            IncidentManager.getAvailableMaterials(),
            IncidentManager.getSeverityOptions(),
            IncidentManager.getStatusOptions(),
        ]);

        if (materialsResult.success && materialsResult.data) {
            setAvailableMaterials(materialsResult.data);
        }

        if (severityResult.success && severityResult.data) {
            setSeverityOptions(severityResult.data);
        }

        if (statusResult.success && statusResult.data) {
            setStatusOptions(statusResult.data);
        }

        // Initialize form data for editing
        if (incident) {
            const incidentDetailResult = await IncidentManager.getById(incident.id);
            if (incidentDetailResult.success && incidentDetailResult.data) {
                const detail = incidentDetailResult.data.data;
                setFormData({
                    material_id: detail.material_id || 0,
                    maintenance_id: detail.maintenance_id || null,
                    description: detail.description,
                    severity: detail.severity,
                    status: detail.status,
                    started_at: detail.started_at,
                    resolved_at: detail.resolved_at,
                });

                // Load maintenances for the selected material
                if (detail.material_id) {
                    await loadMaintenances(detail.material_id);
                }
            }
        } else {
            // Set default material if creating and materials available
            if (materialsResult.success && materialsResult.data && materialsResult.data.length > 0) {
                setFormData((prev) => ({ ...prev, material_id: materialsResult.data![0].id }));
            }
        }

        setIsLoadingOptions(false);
    };

    const loadMaintenances = async (materialId: number) => {
        const result = await IncidentManager.getAvailableMaintenances(materialId);
        if (result.success && result.data) {
            setAvailableMaintenances(result.data);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.material_id) {
            newErrors.material_id = t('incidents.validation.materialRequired');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('validation.required');
        } else if (formData.description.length > 1000) {
            newErrors.description = t('validation.descriptionMaxLength');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        const submitData: IncidentFormData = {
            ...formData,
            maintenance_id: formData.maintenance_id || null,
        };

        let result;
        if (isEditing) {
            result = await IncidentManager.update(incident.id, submitData);
        } else {
            result = await IncidentManager.create(submitData);
        }

        if (result.success) {
            const successMessage = isEditing
                ? t('incidents.messages.updated')
                : t('incidents.messages.created');
            showSuccess(successMessage);
            onSuccess();
            onClose();
        } else {
            showError(result.error || t('errors.generic'));
            setErrors({ general: result.error || t('errors.generic') });
        }
        setIsLoading(false);
    };

    const getSeverityColor = (severity: IncidentSeverity): string => {
        switch (severity) {
            case 'critical':
                return 'text-error-600 dark:text-error-400';
            case 'high':
                return 'text-warning-600 dark:text-warning-400';
            case 'medium':
                return 'text-brand-600 dark:text-brand-400';
            case 'low':
                return 'text-success-600 dark:text-success-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusColor = (status: IncidentStatus): string => {
        switch (status) {
            case 'open':
                return 'text-error-600 dark:text-error-400';
            case 'in_progress':
                return 'text-warning-600 dark:text-warning-400';
            case 'resolved':
                return 'text-success-600 dark:text-success-400';
            case 'closed':
                return 'text-gray-600 dark:text-gray-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? t('incidents.edit') : t('incidents.create')}
            </h2>

            {errors.general && (
                <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Material Selection */}
                    <div>
                        <Label>{t('incidents.material')} *</Label>
                        <div className="relative mt-1.5" ref={materialDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsMaterialDropdownOpen(!isMaterialDropdownOpen)}
                                disabled={isEditing}
                                className={`flex w-full items-center justify-between rounded-lg border ${errors.material_id
                                        ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
                                        : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800'
                                    } bg-white px-4 py-2.5 text-left text-sm text-gray-800 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${isEditing ? 'cursor-not-allowed opacity-60' : ''
                                    }`}
                            >
                                <span className={formData.material_id ? '' : 'text-gray-500 dark:text-gray-400'}>
                                    {formData.material_id
                                        ? availableMaterials.find((m) => m.id === formData.material_id)?.name ||
                                        t('incidents.form.selectMaterial')
                                        : t('incidents.form.selectMaterial')}
                                </span>
                                <FaChevronDown
                                    className={`h-4 w-4 text-gray-400 transition-transform ${isMaterialDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {isMaterialDropdownOpen && !isEditing && (
                                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                    {isLoadingOptions ? (
                                        <div className="p-3 text-center text-sm text-gray-500">
                                            {t('common.loading')}
                                        </div>
                                    ) : availableMaterials.length === 0 ? (
                                        <div className="p-3 text-center text-sm text-gray-500">
                                            {t('incidents.noMaterialsAvailable')}
                                        </div>
                                    ) : (
                                        availableMaterials.map((material) => (
                                            <button
                                                key={material.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        material_id: material.id,
                                                        maintenance_id: null,
                                                    }));
                                                    setIsMaterialDropdownOpen(false);
                                                    if (errors.material_id) {
                                                        setErrors((prev) => ({ ...prev, material_id: '' }));
                                                    }
                                                }}
                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <span className="text-gray-800 dark:text-white/90">
                                                    {material.name}
                                                </span>
                                                {formData.material_id === material.id && (
                                                    <FaCheck className="h-4 w-4 text-brand-500" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {errors.material_id && <p className="mt-1 text-xs text-error-500">{errors.material_id}</p>}
                        {isEditing && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {t('incidents.form.materialCannotBeChanged')}
                            </p>
                        )}
                    </div>

                    {/* Maintenance Selection (Optional) */}
                    <div>
                        <Label>{t('incidents.maintenance')} ({t('common.optional')})</Label>
                        <div className="relative mt-1.5" ref={maintenanceDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsMaintenanceDropdownOpen(!isMaintenanceDropdownOpen)}
                                disabled={!formData.material_id || availableMaintenances.length === 0}
                                className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${!formData.material_id || availableMaintenances.length === 0
                                        ? 'cursor-not-allowed opacity-60'
                                        : ''
                                    }`}
                            >
                                <span
                                    className={formData.maintenance_id ? '' : 'text-gray-500 dark:text-gray-400'}
                                >
                                    {formData.maintenance_id
                                        ? availableMaintenances.find((m) => m.id === formData.maintenance_id)
                                            ?.description || t('incidents.form.selectMaintenance')
                                        : t('incidents.form.selectMaintenance')}
                                </span>
                                <FaChevronDown
                                    className={`h-4 w-4 text-gray-400 transition-transform ${isMaintenanceDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {isMaintenanceDropdownOpen && (
                                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                    {/* Option to clear selection */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, maintenance_id: null }));
                                            setIsMaintenanceDropdownOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                    >
                                        <span>{t('incidents.form.noMaintenance')}</span>
                                        {!formData.maintenance_id && <FaCheck className="h-4 w-4 text-brand-500" />}
                                    </button>
                                    {availableMaintenances.map((maintenance) => (
                                        <button
                                            key={maintenance.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    maintenance_id: maintenance.id,
                                                }));
                                                setIsMaintenanceDropdownOpen(false);
                                            }}
                                            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <span className="text-gray-800 dark:text-white/90 line-clamp-1">
                                                {maintenance.description}
                                            </span>
                                            {formData.maintenance_id === maintenance.id && (
                                                <FaCheck className="h-4 w-4 text-brand-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('incidents.form.maintenanceHint')}
                        </p>
                    </div>

                    {/* Severity Selection */}
                    <div>
                        <Label>{t('incidents.severity')}</Label>
                        <div className="relative mt-1.5" ref={severityDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsSeverityDropdownOpen(!isSeverityDropdownOpen)}
                                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <span className={getSeverityColor(formData.severity || 'medium')}>
                                    {severityOptions.find((s) => s.value === formData.severity)?.label ||
                                        t('incidents.form.selectSeverity')}
                                </span>
                                <FaChevronDown
                                    className={`h-4 w-4 text-gray-400 transition-transform ${isSeverityDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {isSeverityDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                    {severityOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, severity: option.value }));
                                                setIsSeverityDropdownOpen(false);
                                            }}
                                            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <span className={getSeverityColor(option.value)}>{option.label}</span>
                                            {formData.severity === option.value && (
                                                <FaCheck className="h-4 w-4 text-brand-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Selection (only for editing) */}
                    {isEditing && (
                        <div>
                            <Label>{t('incidents.status')}</Label>
                            <div className="relative mt-1.5" ref={statusDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                >
                                    <span className={getStatusColor(formData.status || 'open')}>
                                        {statusOptions.find((s) => s.value === formData.status)?.label ||
                                            t('incidents.form.selectStatus')}
                                    </span>
                                    <FaChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>
                                {isStatusDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, status: option.value }));
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <span className={getStatusColor(option.value)}>{option.label}</span>
                                                {formData.status === option.value && (
                                                    <FaCheck className="h-4 w-4 text-brand-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">{t('common.description')} *</Label>
                        <TextArea
                            id="description"
                            name="description"
                            rows={4}
                            placeholder={t('incidents.form.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={(value) => {
                                setFormData((prev) => ({ ...prev, description: value }));
                                if (errors.description) {
                                    setErrors((prev) => ({ ...prev, description: '' }));
                                }
                            }}
                            error={!!errors.description}
                            hint={errors.description}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {t('common.close')}
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                        {isEditing ? t('common.edit') : t('common.create')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default IncidentModal;
