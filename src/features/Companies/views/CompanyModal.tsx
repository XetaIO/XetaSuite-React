import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { useFormModal } from "@/shared/hooks";
import { CompanyManager } from "../services";
import type { Company, CompanyFormData } from "../types";

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
    onSuccess: () => void;
}

const initialFormData: CompanyFormData = {
    name: "",
    description: "",
};

const validateCompany = (data: CompanyFormData, t: (key: string) => string): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
        errors.name = t("validation.nameRequired");
    } else if (data.name.length > 255) {
        errors.name = t("validation.nameMaxLength");
    }

    if (data.description && data.description.length > 1000) {
        errors.description = t("validation.descriptionMaxLength");
    }

    return errors;
};

export const CompanyModal: FC<CompanyModalProps> = ({ isOpen, onClose, company, onSuccess }) => {
    const { t } = useTranslation();

    const {
        formData,
        errors,
        isLoading,
        isEditing,
        handleChange,
        handleSubmit,
    } = useFormModal<Company, CompanyFormData>({
        initialFormData,
        entity: company,
        isOpen,
        onClose,
        onSuccess,
        translationPrefix: "companies",
        createFn: CompanyManager.create,
        updateFn: CompanyManager.update,
        validate: validateCompany,
        entityToFormData: (entity) => ({
            name: entity.name,
            description: entity.description || "",
        }),
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? t("companies.edit") : t("companies.create")}
            </h2>

            {errors.general && (
                <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t("companies.nameLabel")}</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder={t("companies.form.namePlaceholder")}
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            hint={errors.name}
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">{t("companies.form.descriptionLabel")}</Label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder={t("companies.form.descriptionPlaceholder")}
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${errors.description
                                ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                                : "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                }`}
                        />
                        {errors.description && <p className="mt-1.5 text-xs text-error-500">{errors.description}</p>}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                        {isEditing ? t("common.update") : t("common.create")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
