import { useState, useEffect, type FC, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaXmark } from "react-icons/fa6";
import { Modal, Button } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { PermissionManager } from "../services";
import type { PermissionDetail, PermissionFormData } from "../types";

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    permission?: PermissionDetail;
}

export const PermissionModal: FC<PermissionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    permission,
}) => {
    const { t } = useTranslation();
    const isEditMode = !!permission;

    // Form state
    const [formData, setFormData] = useState<PermissionFormData>({
        name: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes or permission changes
    useEffect(() => {
        if (isOpen) {
            if (permission) {
                setFormData({
                    name: permission.name,
                });
            } else {
                setFormData({
                    name: "",
                });
            }
            setErrors({});
        }
    }, [isOpen, permission]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = t("permissions.validation.nameRequired");
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        const result = isEditMode
            ? await PermissionManager.update(permission!.id, formData)
            : await PermissionManager.create(formData);

        if (result.success) {
            showSuccess(
                isEditMode
                    ? t("common.messages.updated", { name: formData.name })
                    : t("common.messages.created", { name: formData.name })
            );
            onSuccess();
            onClose();
        } else {
            showError(result.error || t("errors.generic"));
        }

        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {isEditMode ? t("permissions.editPermission") : t("permissions.createPermission")}
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
                            type="text"
                            value={formData.name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
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
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting
                                ? t("common.loading")
                                : isEditMode
                                    ? t("common.update")
                                    : t("common.create")}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
