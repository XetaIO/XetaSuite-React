import { useState, useEffect, type FC, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import { Modal, Button, SearchableDropdown, MultiSelectDropdown, Badge } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { showSuccess, showError, formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { UserManager } from "../services";
import type { User, UserFormData, SiteAssignment, AvailableSite, AvailableRole, AvailablePermission } from "../types";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

interface SiteAssignmentUI extends SiteAssignment {
    name?: string;
}

export const UserModal: FC<UserModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();

    const canAssignSite = hasPermission("user.assignSite");
    const canAssignDirectPermission = hasPermission("user.assignDirectPermission");

    // Form state
    const [formData, setFormData] = useState<Omit<UserFormData, 'sites'>>({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        locale: "fr",
        office_phone: "",
        cell_phone: "",
    });
    const [siteAssignments, setSiteAssignments] = useState<SiteAssignmentUI[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Available options
    const [availableSites, setAvailableSites] = useState<AvailableSite[]>([]);
    const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<AvailablePermission[]>([]);
    const [isLoadingSites, setIsLoadingSites] = useState(false);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

    const isEditing = user !== null;

    // Load available options
    useEffect(() => {
        if (isOpen) {
            loadAvailableSites();
            loadAvailableRoles();
            if (canAssignDirectPermission) {
                loadAvailablePermissions();
            }
        }
    }, [isOpen, canAssignDirectPermission]);

    // Initialize form data when editing
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                password: "",
                locale: user.locale,
                office_phone: user.office_phone || "",
                cell_phone: user.cell_phone || "",
            });

            // Build site assignments from user data
            if (user.sites_with_roles) {
                const assignments: SiteAssignmentUI[] = user.sites_with_roles.map((siteRole) => {
                    const sitePermissions = user.sites_with_permissions?.find(
                        (sp) => sp.site.id === siteRole.site.id
                    );
                    return {
                        id: siteRole.site.id,
                        name: siteRole.site.name,
                        roles: Array.isArray(siteRole.roles) ? siteRole.roles : [],
                        permissions: Array.isArray(sitePermissions?.permissions) ? sitePermissions.permissions : [],
                    };
                });
                setSiteAssignments(assignments);
            } else if (user.sites) {
                setSiteAssignments(user.sites.map((site) => ({
                    id: site.id,
                    name: site.name,
                    roles: [],
                    permissions: [],
                })));
            }
        } else {
            setFormData({
                username: "",
                email: "",
                first_name: "",
                last_name: "",
                password: "",
                locale: "fr",
                office_phone: "",
                cell_phone: "",
            });
            setSiteAssignments([]);
        }
        setErrors({});
    }, [user, isOpen]);

    const loadAvailableSites = async () => {
        setIsLoadingSites(true);
        const result = await UserManager.getAvailableSites();
        if (result.success && result.data) {
            setAvailableSites(result.data);
        }
        setIsLoadingSites(false);
    };

    const loadAvailableRoles = async () => {
        setIsLoadingRoles(true);
        const result = await UserManager.getAvailableRoles();
        if (result.success && result.data) {
            setAvailableRoles(result.data);
        }
        setIsLoadingRoles(false);
    };

    const loadAvailablePermissions = async () => {
        setIsLoadingPermissions(true);
        const result = await UserManager.getAvailablePermissions();
        if (result.success && result.data) {
            setAvailablePermissions(result.data);
        }
        setIsLoadingPermissions(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleAddSite = () => {
        // Add first available site not already assigned
        const availableSite = availableSites.find(
            (site) => !siteAssignments.some((sa) => sa.id === site.id)
        );
        if (availableSite) {
            setSiteAssignments((prev) => [
                ...prev,
                { id: availableSite.id, name: availableSite.name, roles: [], permissions: [] },
            ]);
        }
    };

    const handleRemoveSite = (siteId: number) => {
        setSiteAssignments((prev) => prev.filter((sa) => sa.id !== siteId));
    };

    const handleSiteChange = (index: number, siteId: number | null) => {
        if (siteId === null) return;
        const site = availableSites.find((s) => s.id === siteId);

        // Get valid role names for the new site
        const validRoleNames = availableRoles
            .filter((role) => role.site_id === null || role.site_id === siteId)
            .map((role) => role.name);

        setSiteAssignments((prev) => {
            const updated = [...prev];
            // Filter out roles that are not valid for the new site
            const currentRoles = updated[index].roles || [];
            const filteredRoles = currentRoles.filter((roleName) => validRoleNames.includes(roleName));
            updated[index] = { ...updated[index], id: siteId, name: site?.name, roles: filteredRoles };
            return updated;
        });
    };

    const handleRolesChange = (index: number, roleNames: (string | number)[]) => {
        setSiteAssignments((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], roles: Array.isArray(roleNames) ? (roleNames as string[]) : [] };
            return updated;
        });
    };

    const handlePermissionsChange = (index: number, permissionNames: (string | number)[]) => {
        setSiteAssignments((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], permissions: Array.isArray(permissionNames) ? (permissionNames as string[]) : [] };
            return updated;
        });
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = t("validation.required");
        }
        if (!formData.email.trim()) {
            newErrors.email = t("validation.required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("validation.invalidEmail");
        }
        if (!formData.first_name.trim()) {
            newErrors.first_name = t("validation.required");
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = t("validation.required");
        }
        if (!isEditing && formData.password && formData.password.length < 8) {
            newErrors.password = t("validation.minLength", { min: 8 });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        const submitData: UserFormData = {
            ...formData,
            password: formData.password || undefined,
            office_phone: formData.office_phone || undefined,
            cell_phone: formData.cell_phone || undefined,
        };

        if (canAssignSite) {
            submitData.sites = siteAssignments.map((sa) => ({
                id: sa.id,
                roles: sa.roles,
                permissions: canAssignDirectPermission ? sa.permissions : undefined,
            }));
        }

        let result;
        if (isEditing) {
            result = await UserManager.update(user.id, submitData);
        } else {
            result = await UserManager.create(submitData);
        }

        if (result.success) {
            const successMessage = isEditing
                ? t("common.messages.updated", { name: `${formData.first_name} ${formData.last_name}` })
                : t("common.messages.created", { name: `${formData.first_name} ${formData.last_name}` });
            showSuccess(successMessage);
            onSuccess();
        } else {
            showError(result.error || t("errors.generic"));
            setErrors({ general: result.error || t("errors.generic") });
        }
        setIsLoading(false);
        onClose();
    };

    // Prepare site options for dropdown (excluding already assigned sites)
    const getSiteOptionsForIndex = (index: number) => {
        const currentSiteId = siteAssignments[index]?.id;
        return availableSites.filter(
            (site) => site.id === currentSiteId || !siteAssignments.some((sa) => sa.id === site.id)
        );
    };

    // Prepare role options as MultiSelectOption, filtered by site
    // Show only roles where site_id is null (global) or matches the selected site
    const getRoleOptionsForSite = (siteId: number) => {
        return availableRoles
            .filter((role) => role.site_id === null || role.site_id === siteId)
            .map((role) => ({
                id: role.name,
                name: role.name,
            }));
    };

    // Prepare permission options as MultiSelectOption
    const permissionOptions = availablePermissions.map((perm) => ({
        id: perm.name,
        name: perm.name,
    }));

    const isUserDeleted = user?.deleted_at != null;

    const handleRestore = async () => {
        if (!user) return;
        setIsRestoring(true);
        const result = await UserManager.restore(user.id);
        if (result.success) {
            showSuccess(t("users.messages.restored", { name: user.full_name }));
            onSuccess();
            onClose();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsRestoring(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? t("users.edit") : t("users.create")}
            </h2>

            {/* Deleted user warning */}
            {isEditing && isUserDeleted && (
                <div className="mb-6 rounded-lg border border-warning-500 bg-warning-50 p-4 dark:border-warning-500/30 dark:bg-warning-500/15">
                    <div className="flex items-start gap-3">
                        <FaTriangleExclamation className="mt-0.5 h-5 w-5 shrink-0 text-warning-500" />
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                                {t("users.deletedWarning")}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {user.deleted_by ? (
                                    t("users.deletedMessage", {
                                        date: formatDate(user.deleted_at!),
                                        by: user.deleted_by.full_name,
                                    })
                                ) : (
                                    t("users.deletedMessageUnknown", {
                                        date: formatDate(user.deleted_at!),
                                    })
                                )}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {t("users.restoreMessage")}
                            </p>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                className="mt-3"
                                onClick={handleRestore}
                                disabled={isRestoring}
                            >
                                {isRestoring ? t("users.restoring") : t("users.restore")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {errors.general && (
                <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <fieldset disabled={isUserDeleted}>
                    {/* Basic Information */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="first_name">{t("users.firstName")} *</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                type="text"
                                placeholder={t("users.firstNamePlaceholder")}
                                value={formData.first_name}
                                onChange={handleChange}
                                error={!!errors.first_name}
                                hint={errors.first_name}
                            />
                        </div>
                        <div>
                            <Label htmlFor="last_name">{t("users.lastName")} *</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                type="text"
                                placeholder={t("users.lastNamePlaceholder")}
                                value={formData.last_name}
                                onChange={handleChange}
                                error={!!errors.last_name}
                                hint={errors.last_name}
                            />
                        </div>
                        <div>
                            <Label htmlFor="username">{t("users.username")} *</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder={t("users.usernamePlaceholder")}
                                value={formData.username}
                                onChange={handleChange}
                                error={!!errors.username}
                                hint={errors.username}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">{t("users.email")} *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t("users.emailPlaceholder")}
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                hint={errors.email}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">
                                {t("users.password")} {!isEditing && "*"}
                                {isEditing && <span className="text-gray-400">({t("common.optional")})</span>}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={isEditing ? t("users.passwordPlaceholderEdit") : t("users.passwordPlaceholder")}
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                hint={errors.password}
                            />
                        </div>
                        <div>
                            <Label htmlFor="locale">{t("users.locale")}</Label>
                            <select
                                id="locale"
                                name="locale"
                                title={t("users.locale")}
                                value={formData.locale}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-white/5 dark:bg-white/3 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="fr">{t("language.fr")}</option>
                                <option value="en">{t("language.en")}</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="office_phone">{t("users.officePhone")}</Label>
                            <Input
                                id="office_phone"
                                name="office_phone"
                                type="tel"
                                placeholder={t("users.officePhonePlaceholder")}
                                value={formData.office_phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cell_phone">{t("users.cellPhone")}</Label>
                            <Input
                                id="cell_phone"
                                name="cell_phone"
                                type="tel"
                                placeholder={t("users.cellPhonePlaceholder")}
                                value={formData.cell_phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Site Assignments */}
                    {canAssignSite && (
                        <div className="mb-6">
                            <div className="mb-3 flex items-center justify-between">
                                <Label>{t("users.siteAssignments")}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    startIcon={<FaPlus className="h-3 w-3" />}
                                    onClick={handleAddSite}
                                    disabled={siteAssignments.length >= availableSites.length}
                                >
                                    {t("users.addSite")}
                                </Button>
                            </div>

                            <div className="rounded-lg border border-gray-200 dark:border-white/5">
                                <div className="bg-gray-50 px-4 py-2 dark:bg-neutral-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t("users.siteAssignmentsInfo")}
                                    </p>
                                </div>

                                {siteAssignments.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {t("users.noSiteAssignments")}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {siteAssignments.map((assignment, index) => (
                                            <div key={`${assignment.id}-${index}`} className="p-4">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <SearchableDropdown
                                                            value={assignment.id}
                                                            onChange={(id) => handleSiteChange(index, id)}
                                                            options={getSiteOptionsForIndex(index)}
                                                            placeholder={t("users.selectSite")}
                                                            searchPlaceholder={t("common.search")}
                                                            noResultsText={t("common.noResults")}
                                                            loadingText={t("common.loading")}
                                                            isLoading={isLoadingSites}
                                                            renderOption={(site) => (
                                                                <div className="flex items-center gap-2">
                                                                    <span>{site.name}</span>
                                                                    {site.is_headquarters && (
                                                                        <Badge color="brand" size="sm">HQ</Badge>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveSite(assignment.id)}
                                                    >
                                                        <FaTrash className="h-3 w-3 text-error-500" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <Label className="text-xs">{t("users.roles")}</Label>
                                                        <MultiSelectDropdown
                                                            value={assignment.roles || []}
                                                            onChange={(values) => handleRolesChange(index, values)}
                                                            options={getRoleOptionsForSite(assignment.id)}
                                                            placeholder={t("users.selectRoles")}
                                                            searchPlaceholder={t("common.search")}
                                                            noResultsText={t("common.noResults")}
                                                            loadingText={t("common.loading")}
                                                            isLoading={isLoadingRoles}
                                                            selectedCountLabel={(count) => t("users.rolesSelected", { count })}
                                                        />
                                                    </div>

                                                    {canAssignDirectPermission && (
                                                        <div>
                                                            <Label className="text-xs">{t("users.directPermissions")}</Label>
                                                            <MultiSelectDropdown
                                                                value={assignment.permissions || []}
                                                                onChange={(values) => handlePermissionsChange(index, values)}
                                                                options={permissionOptions}
                                                                placeholder={t("users.selectPermissions")}
                                                                searchPlaceholder={t("common.search")}
                                                                noResultsText={t("common.noResults")}
                                                                loadingText={t("common.loading")}
                                                                isLoading={isLoadingPermissions}
                                                                selectedCountLabel={(count) => t("users.permissionsSelected", { count })}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </fieldset>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading} disabled={isUserDeleted}>
                        {isEditing ? t("common.update") : t("common.create")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UserModal;
