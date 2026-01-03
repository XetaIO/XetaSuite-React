import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { FaXmark } from "react-icons/fa6";
import { Modal, Button } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { useFormModal } from "@/shared/hooks";
import { PermissionManager } from "../services";
import type { PermissionDetail, PermissionFormData } from "../types";

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    permission?: PermissionDetail;
}

const initialFormData: PermissionFormData = {
    name: "",
};

const validatePermission = (data: PermissionFormData, t: (key: string) => string): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
        errors.name = t("permissions.validation.nameRequired");
    }

    return errors;
};

export const PermissionModal: FC<PermissionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    permission,
}) => {
    const { t } = useTranslation();

    const {
        formData,
        errors,
        isLoading,
        isEditing,
        handleChange,
        handleSubmit,
    } = useFormModal<PermissionDetail, PermissionFormData>({
        initialFormData,
        entity: permission ?? null,
        isOpen,
        onClose,
        onSuccess,
        translationPrefix: "common", // Uses common.messages.created/updated
        createFn: PermissionManager.create,
        updateFn: PermissionManager.update,
        validate: validatePermission,
        entityToFormData: (entity) => ({
            name: entity.name,
        }),
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {isEditing ? t("permissions.editPermission") : t("permissions.createPermission")}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        title={t("common.close")}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <FaXmark className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">{t("permissions.name")} *</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            hint={errors.name}
                            placeholder={t("permissions.namePlaceholder")}
                            className="font-mono"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t("permissions.nameHint")}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading
                                ? t("common.loading")
                                : isEditing
                                    ? t("common.update")
                                    : t("common.create")}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
