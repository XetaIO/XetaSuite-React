import { useState, useEffect, useCallback, type FC, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaXmark } from "react-icons/fa6";
import { Modal, Button, MultiSelectDropdown, type MultiSelectOption } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { RoleManager } from "../services";
import type { RoleDetail, RoleFormData, AvailablePermission } from "../types";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    role?: RoleDetail;
}

export const RoleModal: FC<RoleModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    role,
}) => {
    const { t } = useTranslation();
    const isEditMode = !!role;

    // Form state
    const [formData, setFormData] = useState<RoleFormData>({
        name: "",
        permissions: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Available permissions
    const [availablePermissions, setAvailablePermissions] = useState<AvailablePermission[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [permissionSearch, setPermissionSearch] = useState("");
    // Cache of selected permissions to preserve names during search
    const [selectedPermissionsCache, setSelectedPermissionsCache] = useState<Map<number, AvailablePermission>>(new Map());

    // Reset form when modal opens/closes or role changes
    useEffect(() => {
        if (isOpen) {
            if (role) {
                setFormData({
                    name: role.name,
                    permissions: role.permissions?.map((p) => p.id) || [],
                });
                // Initialize cache with role's permissions
                const cache = new Map<number, AvailablePermission>();
                role.permissions?.forEach((p) => cache.set(p.id, p));
                setSelectedPermissionsCache(cache);
            } else {
                setFormData({
                    name: "",
                    permissions: [],
                });
                setSelectedPermissionsCache(new Map());
            }
            setErrors({});
            setPermissionSearch("");
        }
    }, [isOpen, role]);

    // Fetch available permissions
    const fetchPermissions = useCallback(async (search?: string) => {
        setIsLoadingPermissions(true);
        const result = await RoleManager.getAvailablePermissions(search, search ? undefined : 30);
        if (result.success && result.data) {
            setAvailablePermissions(result.data);
        }
        setIsLoadingPermissions(false);
    }, []);

    // Load permissions when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPermissions();
        }
    }, [isOpen, fetchPermissions]);

    // Handle permission search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (permissionSearch) {
                fetchPermissions(permissionSearch);
            } else {
                fetchPermissions();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [permissionSearch, fetchPermissions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = t("roles.validation.nameRequired");
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        const result = isEditMode
            ? await RoleManager.update(role!.id, formData)
            : await RoleManager.create(formData);

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

    // Convert permissions to MultiSelectOption format
    // Include cached selected permissions that may not be in current search results
    const permissionOptions: MultiSelectOption[] = (() => {
        const optionsMap = new Map<number, MultiSelectOption>();

        // First add all cached selected permissions
        selectedPermissionsCache.forEach((p) => {
            optionsMap.set(p.id, { id: p.id, name: p.name });
        });

        // Then add/override with available permissions from API
        availablePermissions.forEach((p) => {
            optionsMap.set(p.id, { id: p.id, name: p.name });
        });

        return Array.from(optionsMap.values());
    })();

    // Get selected permission IDs
    const selectedPermissionIds = formData.permissions || [];

    const handlePermissionsChange = (selected: (number | string)[]) => {
        const numericIds = selected.filter((id): id is number => typeof id === "number");

        // Update cache: add newly selected permissions, remove deselected ones
        setSelectedPermissionsCache((prevCache) => {
            const newCache = new Map(prevCache);

            // Add any newly selected permissions from availablePermissions
            numericIds.forEach((id) => {
                if (!newCache.has(id)) {
                    const permission = availablePermissions.find((p) => p.id === id);
                    if (permission) {
                        newCache.set(id, permission);
                    }
                }
            });

            // Remove deselected permissions from cache
            prevCache.forEach((_, id) => {
                if (!numericIds.includes(id)) {
                    newCache.delete(id);
                }
            });

            return newCache;
        });

        setFormData((prev) => ({
            ...prev,
            permissions: numericIds,
        }));
    };

    // Get selected permissions for display (need to show names)
    // Use the cache which preserves permissions even during search
    const getSelectedPermissions = (): MultiSelectOption[] => {
        const result: MultiSelectOption[] = [];

        for (const id of selectedPermissionIds) {
            const cached = selectedPermissionsCache.get(id);
            if (cached) {
                result.push({ id: cached.id, name: cached.name });
                continue;
            }
            // Fallback to available permissions
            const available = availablePermissions.find((p) => p.id === id);
            if (available) {
                result.push({ id: available.id, name: available.name });
            }
        }

        return result;
    };

    // Get permission description from translation
    const getPermissionDescription = (permissionName: string): string => {
        // Permission format: "resource.action" (e.g., "user.create", "item-movement.viewAny")
        const parts = permissionName.split(".");
        if (parts.length !== 2) return permissionName;
        const [resource, action] = parts;
        const key = `roles.permissionDescriptions.${resource}.${action}`;
        const description = t(key);
        // If no translation found, return the permission name
        return description === key ? permissionName : description;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {isEditMode ? t("roles.editRole") : t("roles.createRole")}
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
                        <Label htmlFor="name">{t("roles.name")} *</Label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            error={!!errors.name}
                            hint={errors.name}
                            placeholder={t("roles.namePlaceholder")}
                        />
                    </div>

                    {/* Permissions */}
                    <div>
                        <Label>{t("roles.permissions")}</Label>
                        <MultiSelectDropdown
                            value={selectedPermissionIds}
                            onChange={handlePermissionsChange}
                            options={permissionOptions}
                            placeholder={t("roles.selectPermissions")}
                            searchPlaceholder={t("roles.searchPermissions")}
                            noResultsText={t("common.noResults")}
                            loadingText={t("common.loading")}
                            isLoading={isLoadingPermissions}
                            onSearch={setPermissionSearch}
                            renderOption={(option) => (
                                <div className="flex flex-col gap-0.5" title={getPermissionDescription(option.name)}>
                                    <span className="font-mono text-xs text-gray-900 dark:text-gray-100">{option.name}</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {getPermissionDescription(option.name)}
                                    </span>
                                </div>
                            )}
                        />
                        {/* Selected permissions count */}
                        {selectedPermissionIds.length > 0 && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {t("roles.selectedPermissionsCount", { count: selectedPermissionIds.length })}
                            </p>
                        )}
                        {/* Display selected permissions as tags */}
                        {selectedPermissionIds.length > 0 && (
                            <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
                                <div className="flex flex-wrap gap-2">
                                    {getSelectedPermissions().map((permission) => (
                                        <span
                                            key={permission.id}
                                            title={getPermissionDescription(permission.name)}
                                            className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800 dark:bg-brand-500/20 dark:text-brand-200"
                                        >
                                            <span className="font-mono">{permission.name}</span>
                                            <button
                                                type="button"
                                                title={t("common.remove")}
                                                onClick={() =>
                                                    handlePermissionsChange(
                                                        selectedPermissionIds.filter((id) => id !== permission.id)
                                                    )
                                                }
                                                className="ml-1 rounded-full p-0.5 hover:bg-brand-200 dark:hover:bg-brand-500/30"
                                            >
                                                <FaXmark className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
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
