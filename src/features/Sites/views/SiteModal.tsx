import { useState, useEffect, type FC, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "@/shared/components/ui";
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
    address_line_1: "",
    postal_code: "",
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
                address_line_1: site.address_line_1 || "",
                postal_code: site.postal_code || "",
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

    const handleManagerToggle = (userId: number) => {
        setSelectedManagerIds((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            }
            return [...prev, userId];
        });
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
                        <Label htmlFor="name">{t("sites.form.name")}</Label>
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
                        <div className="mt-1.5 max-h-40 overflow-y-auto rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                            {isLoadingUsers ? (
                                <div className="flex items-center justify-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {t("common.loading")}
                                </div>
                            ) : users.length === 0 ? (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t("sites.form.noUsersAvailable")}
                                </div>
                            ) : (
                                users.map((user) => (
                                    <label
                                        key={user.id}
                                        className={`flex cursor-pointer items-center px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedManagerIds.includes(user.id)
                                                ? "bg-brand-50 dark:bg-brand-500/10"
                                                : ""
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedManagerIds.includes(user.id)}
                                            onChange={() => handleManagerToggle(user.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        <span className="ml-3 text-sm text-gray-900 dark:text-white">
                                            {user.full_name}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
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
                        <Label htmlFor="address_line_1">{t("sites.form.address")}</Label>
                        <Input
                            id="address_line_1"
                            name="address_line_1"
                            type="text"
                            placeholder={t("sites.form.addressPlaceholder")}
                            value={formData.address_line_1}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Postal code & City row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="postal_code">{t("sites.form.postalCode")}</Label>
                            <Input
                                id="postal_code"
                                name="postal_code"
                                type="text"
                                placeholder={t("sites.form.postalCodePlaceholder")}
                                value={formData.postal_code}
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
