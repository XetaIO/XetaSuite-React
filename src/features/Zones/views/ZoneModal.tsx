import { useState, useEffect, useCallback, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "@/shared/components/ui";
import { Label, Input, Checkbox } from "@/shared/components/form";
import { useFormModal } from "@/shared/hooks";
import { ZoneManager } from "../services";
import type { Zone, ZoneFormData, ParentZoneOption } from "../types";

interface ZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    zone: Zone | null;
    onSuccess: () => void;
}

type ZoneFormDataWithoutSiteId = Omit<ZoneFormData, "site_id">;

const initialFormData: ZoneFormDataWithoutSiteId = {
    name: "",
    parent_id: null,
    allow_material: false,
};

const validateZone = (data: ZoneFormDataWithoutSiteId, t: (key: string) => string): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
        errors.name = t("validation.nameRequired");
    } else if (data.name.length > 255) {
        errors.name = t("validation.nameMaxLength");
    }

    return errors;
};

export const ZoneModal: FC<ZoneModalProps> = ({
    isOpen,
    onClose,
    zone,
    onSuccess,
}) => {
    const { t } = useTranslation();

    // Parent zones for selection
    const [parentZones, setParentZones] = useState<ParentZoneOption[]>([]);
    const [isLoadingParents, setIsLoadingParents] = useState(false);

    const loadParentZones = useCallback(async (excludeZoneId?: number) => {
        setIsLoadingParents(true);
        const result = await ZoneManager.getAvailableParents(excludeZoneId);
        if (result.success && result.data) {
            setParentZones(result.data.data);
        }
        setIsLoadingParents(false);
    }, []);

    // Load parent zones when modal opens
    useEffect(() => {
        if (isOpen) {
            loadParentZones(zone?.id);
        }
    }, [isOpen, zone?.id, loadParentZones]);

    const {
        formData,
        errors,
        isLoading,
        isEditing,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
        setFieldValue,
    } = useFormModal<Zone, ZoneFormDataWithoutSiteId>({
        initialFormData,
        entity: zone,
        isOpen,
        onClose,
        onSuccess,
        translationPrefix: "zones",
        createFn: ZoneManager.create,
        updateFn: ZoneManager.update,
        validate: validateZone,
        entityToFormData: (entity) => ({
            name: entity.name,
            parent_id: entity.parent_id,
            allow_material: entity.allow_material,
        }),
    });

    const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const parentId = value ? parseInt(value, 10) : null;
        setFieldValue("parent_id", parentId);
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
                        <Label htmlFor="name">{t("common.name")} *</Label>
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
                            value={formData.parent_id ?? ""}
                            onChange={handleParentChange}
                            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:bg-gray-900 dark:focus:border-brand-800"
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
                            onChange={handleCheckboxChange("allow_material")}
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
