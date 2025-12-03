import { useState, useEffect, type FC, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaMagnifyingGlass } from "react-icons/fa6";
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
    const [userSearch, setUserSearch] = useState("");

    const isEditing = site !== null;

    // Load users when modal opens (only in edit mode - we need the site ID)
    useEffect(() => {
        if (isOpen && site) {
            loadUsers(site.id, userSearch);
        } else if (!isOpen) {
            setUsers([]);
            setUserSearch("");
        }
    }, [isOpen, site, userSearch]);

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

    const loadUsers = async (siteId: number, search?: string) => {
        setIsLoadingUsers(true);
        const result = await SiteManager.getUsers(siteId, search || undefined);
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
                        {/* Search field */}
                        <div className="relative mt-1.5">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("common.search")}
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full rounded-t-lg border border-gray-300 bg-transparent py-2 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                            {userSearch && (
                                <button
                                    type="button"
                                    onClick={() => setUserSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    title={t("common.clearSearch")}
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {/* Users list */}
                        <div className="max-h-48 overflow-y-auto rounded-b-lg border border-t-0 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                            {isLoadingUsers ? (
                                <div className="flex items-center justify-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {t("common.loading")}
                                </div>
                            ) : users.length === 0 ? (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {userSearch ? t("common.noSearchResults") : t("sites.form.noUsersAvailable")}
                                </div>
                            ) : (
                                users.map((user) => (
                                    <label
                                        key={user.id}
                                        className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedManagerIds.includes(user.id)
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
                                        <div className="flex flex-1 items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.full_name}
                                            </span>
                                            {user.roles && user.roles.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.slice(0, 2).map((role) => (
                                                        <span
                                                            key={role}
                                                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                    {user.roles.length > 2 && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            +{user.roles.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
