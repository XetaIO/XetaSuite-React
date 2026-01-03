import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "@/shared/components/ui";
import { Label, Input, Checkbox } from "@/shared/components/form";
import { useFormModal } from "@/shared/hooks";
import { CompanyManager } from "../services";
import type { Company, CompanyFormData, CompanyType } from "../types";

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
    onSuccess: () => void;
}

const initialFormData: CompanyFormData = {
    name: "",
    description: "",
    types: [],
    email: "",
    phone: "",
    address: "",
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

    if (data.types.length === 0) {
        errors.types = t("validation.typesRequired");
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = t("validation.email");
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
        setFormData,
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
            types: entity.types || [],
            email: entity.email || "",
            phone: entity.phone || "",
            address: entity.address || "",
        }),
    });

    const handleTypeChange = (type: CompanyType) => (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            types: checked
                ? [...prev.types, type]
                : prev.types.filter(t => t !== type)
        }));
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

                    {/* Company Types */}
                    <div>
                        <Label>{t("companies.form.typesLabel")}</Label>
                        <div className="mt-2 flex flex-col gap-3">
                            <Checkbox
                                id="type_item_provider"
                                label={t("companies.types.item_provider")}
                                checked={formData.types.includes('item_provider')}
                                onChange={handleTypeChange('item_provider')}
                            />
                            <Checkbox
                                id="type_maintenance_provider"
                                label={t("companies.types.maintenance_provider")}
                                checked={formData.types.includes('maintenance_provider')}
                                onChange={handleTypeChange('maintenance_provider')}
                            />
                        </div>
                        {errors.types && <p className="mt-1.5 text-xs text-error-500">{errors.types}</p>}
                    </div>

                    {/* Contact Information */}
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t("companies.form.contactInfo")}</p>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">{t("companies.form.emailLabel")}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={t("companies.form.emailPlaceholder")}
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    hint={errors.email}
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">{t("companies.form.phoneLabel")}</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder={t("companies.form.phonePlaceholder")}
                                    value={formData.phone || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="address">{t("companies.form.addressLabel")}</Label>
                                <textarea
                                    id="address"
                                    name="address"
                                    placeholder={t("companies.form.addressPlaceholder")}
                                    value={formData.address || ""}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                        </div>
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
