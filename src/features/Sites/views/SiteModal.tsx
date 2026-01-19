import { useState, useEffect, type FC, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button, MultiSelectDropdown } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { SiteManager } from "../services";
import type { Site, SiteFormData, UserOption } from "../types";

interface SiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    site: Site | null;
    onSuccess: () => void;
}

const initialFormData: SiteFormData = {
    name: "",
    email: "",
    office_phone: "",
    cell_phone: "",
    address: "",
    zip_code: "",
    city: "",
    manager_ids: [],
};

export const SiteModal: FC<SiteModalProps> = ({ isOpen, onClose, site, onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<SiteFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Users for manager selection
    const [users, setUsers] = useState<UserOption[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [selectedManagerIds, setSelectedManagerIds] = useState<number[]>([]);

    const isEditing = site !== null;

    // Load users when modal opens (only in edit mode - we need the site ID)
    useEffect(() => {
        if (isOpen && site) {
            loadUsers(site.id);
        } else if (!isOpen) {
            setUsers([]);
        }
    }, [isOpen, site]);

    // Initialize form data when site changes
    useEffect(() => {
        if (site) {
            setFormData({
                name: site.name,
                email: site.email || "",
                office_phone: site.office_phone || "",
                cell_phone: site.cell_phone || "",
                address: site.address || "",
                zip_code: site.zip_code || "",
                city: site.city || "",
                manager_ids: site.managers?.map((m) => m.id) || [],
            });
            setSelectedManagerIds(site.managers?.map((m) => m.id) || []);
        } else {
            setFormData(initialFormData);
            setSelectedManagerIds([]);
        }
        setErrors({});
    }, [site, isOpen]);

    const loadUsers = async (siteId: number) => {
        setIsLoadingUsers(true);
        const result = await SiteManager.getUsers(siteId);
        if (result.success && result.data) {
            setUsers(result.data);
        }
        setIsLoadingUsers(false);
    };

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        const dataToSubmit: SiteFormData = {
            ...formData,
            manager_ids: selectedManagerIds,
        };

        let result;
        if (isEditing) {
            result = await SiteManager.update(site.id, dataToSubmit);
        } else {
            result = await SiteManager.create(dataToSubmit);
        }

        if (result.success) {
            const successMessage = isEditing
                ? t("sites.messages.updated", { name: formData.name })
                : t("sites.messages.created", { name: formData.name });
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? t("sites.edit") : t("sites.create")}
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
                            placeholder={t("sites.form.namePlaceholder")}
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            hint={errors.name}
                        />
                    </div>

                    {/* Managers selection */}
                    <div>
                        <Label>{t("sites.form.managers")}</Label>
                        <MultiSelectDropdown
                            value={selectedManagerIds}
                            onChange={(values) => setSelectedManagerIds(values as number[])}
                            options={users.map((user) => ({
                                id: user.id,
                                name: user.full_name,
                                roles: user.roles,
                            }))}
                            placeholder={t("sites.form.selectManagers")}
                            searchPlaceholder={t("common.search")}
                            noResultsText={t("common.noSearchResults")}
                            loadingText={t("common.loading")}
                            isLoading={isLoadingUsers}
                            selectedCountLabel={(count) => t("sites.form.managersSelected", { count })}
                            renderOption={(option) => (
                                <div className="flex flex-1 items-center justify-between">
                                    <span className="text-gray-800 dark:text-white/90">
                                        {option.name}
                                    </span>
                                    {option.roles && option.roles.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {option.roles.slice(0, 2).map((role: string) => (
                                                <span
                                                    key={role}
                                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-neutral-700 dark:text-gray-300"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                            {option.roles.length > 2 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    +{option.roles.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t("sites.form.managersHint")}
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">{t("sites.form.email")}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t("sites.form.emailPlaceholder")}
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            hint={errors.email}
                        />
                    </div>

                    {/* Phones row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="office_phone">{t("sites.form.officePhone")}</Label>
                            <Input
                                id="office_phone"
                                name="office_phone"
                                type="tel"
                                placeholder={t("sites.form.officePhonePlaceholder")}
                                value={formData.office_phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cell_phone">{t("sites.form.cellPhone")}</Label>
                            <Input
                                id="cell_phone"
                                name="cell_phone"
                                type="tel"
                                placeholder={t("sites.form.cellPhonePlaceholder")}
                                value={formData.cell_phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <Label htmlFor="address">{t("sites.form.address")}</Label>
                        <Input
                            id="address"
                            name="address"
                            type="text"
                            placeholder={t("sites.form.addressPlaceholder")}
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Postal code & City row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="zip_code">{t("sites.form.zipCode")}</Label>
                            <Input
                                id="zip_code"
                                name="zip_code"
                                type="text"
                                placeholder={t("sites.form.zipCodePlaceholder")}
                                value={formData.zip_code}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">{t("sites.form.city")}</Label>
                            <Input
                                id="city"
                                name="city"
                                type="text"
                                placeholder={t("sites.form.cityPlaceholder")}
                                value={formData.city}
                                onChange={handleChange}
                            />
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

export default SiteModal;
