import { useState, useEffect, type FC, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "@/shared/components/ui";
import { Label, Input, Checkbox } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { ZoneManager } from "../services";
import type { Zone, ZoneFormData, ParentZoneOption } from "../types";

interface ZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    zone: Zone | null;
    onSuccess: () => void;
}

const initialFormData: Omit<ZoneFormData, 'site_id'> = {
    name: "",
    parent_id: null,
    allow_material: false,
};

export const ZoneModal: FC<ZoneModalProps> = ({
    isOpen,
    onClose,
    zone,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<ZoneFormData, 'site_id'>>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Parent zones for selection
    const [parentZones, setParentZones] = useState<ParentZoneOption[]>([]);
    const [isLoadingParents, setIsLoadingParents] = useState(false);

    const isEditing = zone !== null;

    // Load parent zones when modal opens
    useEffect(() => {
        if (isOpen) {
            loadParentZones(zone?.id);
        }
    }, [isOpen, zone?.id]);

    // Initialize form data when zone changes
    useEffect(() => {
        if (zone) {
            setFormData({
                name: zone.name,
                parent_id: zone.parent_id,
                allow_material: zone.allow_material,
            });
        } else {
            setFormData(initialFormData);
        }
        setErrors({});
    }, [zone, isOpen]);

    const loadParentZones = async (excludeZoneId?: number) => {
        setIsLoadingParents(true);
        const result = await ZoneManager.getAvailableParents(excludeZoneId);
        if (result.success && result.data) {
            setParentZones(result.data.data);
        }
        setIsLoadingParents(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else if (name === "parent_id") {
            const parentId = value ? parseInt(value, 10) : null;
            setFormData((prev) => ({ ...prev, parent_id: parentId }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, allow_material: checked }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("validation.nameRequired");
        } else if (formData.name.length > 255) {
            newErrors.name = t("validation.nameMaxLength");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        let result;
        if (isEditing) {
            result = await ZoneManager.update(zone.id, formData);
        } else {
            result = await ZoneManager.create(formData);
        }

        if (result.success) {
            const successMessage = isEditing
                ? t("zones.messages.updated", { name: formData.name })
                : t("zones.messages.created", { name: formData.name });
            showSuccess(successMessage);
            onSuccess();
            onClose();
        } else {
            showError(result.error || t("errors.generic"));
            setErrors({ general: result.error || t("errors.generic") });
        }
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? t("zones.edit") : t("zones.create")}
            </h2>

            {errors.general && (
                <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">{t("common.name")}</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder={t("zones.form.namePlaceholder")}
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            hint={errors.name}
                        />
                    </div>

                    {/* Parent Zone Selection */}
                    <div>
                        <Label htmlFor="parent_id">{t("zones.parent")}</Label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            title={t("zones.parent")}
                            value={formData.parent_id || ""}
                            onChange={handleChange}
                            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
                        >
                            <option value="">{t("zones.form.noParent")}</option>
                            {isLoadingParents ? (
                                <option disabled>{t("common.loading")}</option>
                            ) : (
                                parentZones.map((parent) => (
                                    <option key={parent.id} value={parent.id}>
                                        {parent.name}
                                    </option>
                                ))
                            )}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t("zones.form.parentHint")}
                        </p>
                    </div>

                    {/* Allow Material Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                        <Checkbox
                            id="allow_material"
                            checked={formData.allow_material}
                            onChange={handleCheckboxChange}
                        />
                        <div>
                            <Label htmlFor="allow_material" className="cursor-pointer">
                                {t("zones.form.allowMaterial")}
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t("zones.form.allowMaterialHint")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {t("common.close")}
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                        {isEditing ? t("common.edit") : t("common.create")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ZoneModal;
