import { useState, useEffect, type FC, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { CompanyManager } from "../services";
import type { Company, CompanyFormData } from "../types";

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
    onSuccess: () => void;
}

export const CompanyModal: FC<CompanyModalProps> = ({ isOpen, onClose, company, onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<CompanyFormData>({
        name: "",
        description: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = company !== null;

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name,
                description: company.description || "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
            });
        }
        setErrors({});
    }, [company, isOpen]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("validation.nameRequired");
        } else if (formData.name.length > 255) {
            newErrors.name = t("validation.nameMaxLength");
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description = t("validation.descriptionMaxLength");
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
            result = await CompanyManager.update(company.id, formData);
        } else {
            result = await CompanyManager.create(formData);
        }

        if (result.success) {
            const successMessage = isEditing
                ? t("companies.messages.updated", { name: formData.name })
                : t("companies.messages.created", { name: formData.name });
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
