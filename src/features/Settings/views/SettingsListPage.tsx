import { useState, useEffect, useCallback, type FC } from "react";
import { useTranslation } from "react-i18next";
import { PageMeta, PageBreadcrumb } from "@/shared/components/common";
import { Button, Alert } from "@/shared/components/ui";
import { Label, Input, Switch } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { SettingsManager } from "../services";
import { useSettings } from "../store";
import type { Setting } from "../types";

const SettingsListPage: FC = () => {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();
    const { refreshSettings } = useSettings();
    const [settings, setSettings] = useState<Setting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    // Permissions
    const canView = isOnHeadquarters && hasPermission("setting.viewAny");
    const canUpdate = isOnHeadquarters && hasPermission("setting.update");

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await SettingsManager.getAll();
        if (result.success && result.data) {
            setSettings(result.data);
        } else {
            setError(result.error || t("errors.generic"));
        }
        setIsLoading(false);
    }, [t]);

    useEffect(() => {
        if (canView) {
            fetchSettings();
        }
    }, [fetchSettings, canView]);

    const handleEdit = (setting: Setting) => {
        setEditingId(setting.id);
        setEditValue(String(setting.value));
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue("");
    };

    const handleSave = async (setting: Setting) => {
        setIsSaving(true);
        const result = await SettingsManager.update(setting.id, { value: editValue });

        if (result.success && result.data) {
            setSettings(prev => prev.map(s => s.id === setting.id ? result.data! : s));
            showSuccess(t("settings.messages.updated", { name: getSettingLabel(setting.key) }));
            setEditingId(null);
            setEditValue("");
            // Refresh the global settings context
            await refreshSettings();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsSaving(false);
    };

    const handleToggle = async (setting: Setting, newValue: boolean) => {
        setIsSaving(true);
        const result = await SettingsManager.update(setting.id, { value: newValue });

        if (result.success && result.data) {
            setSettings(prev => prev.map(s => s.id === setting.id ? result.data! : s));
            showSuccess(t("settings.messages.updated", { name: getSettingLabel(setting.key) }));
            // Refresh the global settings context
            await refreshSettings();
        } else {
            showError(result.error || t("errors.generic"));
        }
        setIsSaving(false);
    };

    const getSettingLabel = (key: string): string => {
        const labelKey = `settings.keys.${key}`;
        const translated = t(labelKey);
        return translated !== labelKey ? translated : key;
    };

    const getSettingDescription = (key: string): string => {
        const descKey = `settings.descriptions.${key}`;
        const translated = t(descKey);
        return translated !== descKey ? translated : "";
    };

    const renderSettingInput = (setting: Setting) => {
        const isEditing = editingId === setting.id;
        const isBoolean = typeof setting.value === "boolean";

        if (isBoolean) {
            return (
                <div className="flex items-center gap-4">
                    <Switch
                        label=""
                        defaultChecked={setting.value as boolean}
                        onChange={(checked: boolean) => handleToggle(setting, checked)}
                        disabled={!canUpdate || isSaving}
                    />
                    <span className={`text-sm ${setting.value ? "text-success-600 dark:text-success-400" : "text-gray-500 dark:text-gray-400"}`}>
                        {setting.value ? t("common.enabled") : t("common.disabled")}
                    </span>
                </div>
            );
        }

        if (isEditing) {
            return (
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-xs"
                        disabled={isSaving}
                    />
                    <Button
                        size="sm"
                        onClick={() => handleSave(setting)}
                        disabled={isSaving}
                    >
                        {t("common.save")}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        {t("common.cancel")}
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {String(setting.value)}
                </span>
                {canUpdate && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(setting)}
                    >
                        {t("common.edit")}
                    </Button>
                )}
            </div>
        );
    };

    if (!canView) {
        return (
            <>
                <PageMeta title={t("settings.title")} description={t("settings.applicationSettingsDescription")} />
                <Alert variant="error" title={t("errors.forbidden")} message={t("errors.noPermission")} />
            </>
        );
    }

    return (
        <>
            <PageMeta title={t("settings.title")} description={t("settings.applicationSettingsDescription")} />
            <PageBreadcrumb pageTitle={t("settings.title")} />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {t("settings.applicationSettings")}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("settings.applicationSettingsDescription")}
                    </p>
                </div>

                {error && (
                    <Alert variant="error" title={t("common.error")} message={error} className="mb-4" />
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                            {t("common.loading")}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {settings.map((setting) => (
                            <div
                                key={setting.id}
                                className="flex flex-col gap-2 border-b border-gray-200 pb-6 last:border-0 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex-1">
                                    <Label className="text-base font-medium">
                                        {getSettingLabel(setting.key)}
                                    </Label>
                                    {getSettingDescription(setting.key) && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {getSettingDescription(setting.key)}
                                        </p>
                                    )}
                                    {setting.updater && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {t("common.editedBy")}: {setting.updater.full_name}
                                        </p>
                                    )}
                                </div>
                                <div className="shrink-0">
                                    {renderSettingInput(setting)}
                                </div>
                            </div>
                        ))}

                        {settings.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {t("settings.noSettings")}
                            </div>
                        )}
                    </div>
                )}

                {!isOnHeadquarters && (
                    <Alert variant="warning" message={t("settings.headquartersOnly")} className="mt-6" />
                )}
            </div>
        </>
    );
};

export default SettingsListPage;
