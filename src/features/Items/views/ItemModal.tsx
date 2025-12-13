import { useState, useEffect, useCallback, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button, SearchableDropdown, type PinnedItem } from "@/shared/components/ui";
import { Input, Label, Checkbox } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { ItemManager } from "../services";
import type {
    Item,
    ItemFormData,
    AvailableSupplier,
    AvailableMaterial,
    AvailableRecipient,
} from "../types";

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Item | null;
    onSuccess: () => void;
}

export const ItemModal: FC<ItemModalProps> = ({ isOpen, onClose, item, onSuccess }) => {
    const { t } = useTranslation();
    const isEditing = !!item;

    const [formData, setFormData] = useState<ItemFormData>(ItemManager.getDefaultFormData());
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
    const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dropdown options
    const [suppliers, setSuppliers] = useState<AvailableSupplier[]>([]);
    const [materials, setMaterials] = useState<AvailableMaterial[]>([]);
    const [recipients, setRecipients] = useState<AvailableRecipient[]>([]);

    // Search filters for materials and recipients (supplier uses SearchableDropdown)
    const [materialSearch, setMaterialSearch] = useState("");
    const [recipientSearch, setRecipientSearch] = useState("");

    // Original supplier for pinned item when editing
    const [originalSupplier, setOriginalSupplier] = useState<AvailableSupplier | null>(null);

    // Debounce refs for materials and recipients
    const materialSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const recipientSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Search suppliers (includeId ensures current supplier is always included)
    const searchSuppliers = useCallback(async (search: string) => {
        setIsLoadingSuppliers(true);
        const result = await ItemManager.getAvailableSuppliers(search || undefined, formData.supplier_id ?? undefined);
        if (result.success && result.data) {
            setSuppliers(result.data);
        }
        setIsLoadingSuppliers(false);
    }, [formData.supplier_id]);

    // Search materials with debounce
    const searchMaterials = useCallback(async (search: string) => {
        setIsLoadingMaterials(true);
        const result = await ItemManager.getAvailableMaterials(search || undefined);
        if (result.success && result.data) {
            setMaterials(result.data);
        }
        setIsLoadingMaterials(false);
    }, []);

    // Search recipients with debounce
    const searchRecipients = useCallback(async (search: string) => {
        setIsLoadingRecipients(true);
        const result = await ItemManager.getAvailableRecipients(search || undefined);
        if (result.success && result.data) {
            setRecipients(result.data);
        }
        setIsLoadingRecipients(false);
    }, []);

    // Handle material search with debounce
    const handleMaterialSearch = (value: string) => {
        setMaterialSearch(value);
        if (materialSearchTimeout.current) {
            clearTimeout(materialSearchTimeout.current);
        }
        materialSearchTimeout.current = setTimeout(() => {
            searchMaterials(value);
        }, 300);
    };

    // Handle recipient search with debounce
    const handleRecipientSearch = (value: string) => {
        setRecipientSearch(value);
        if (recipientSearchTimeout.current) {
            clearTimeout(recipientSearchTimeout.current);
        }
        recipientSearchTimeout.current = setTimeout(() => {
            searchRecipients(value);
        }, 300);
    };

    // Load dropdown data (supplierId ensures current supplier is included in edit mode)
    const loadDropdownData = useCallback(async (supplierId?: number | null) => {
        setIsLoadingDropdowns(true);
        const [suppliersResult, materialsResult, recipientsResult] = await Promise.all([
            ItemManager.getAvailableSuppliers(undefined, supplierId ?? undefined),
            ItemManager.getAvailableMaterials(),
            ItemManager.getAvailableRecipients(),
        ]);

        if (suppliersResult.success && suppliersResult.data) {
            setSuppliers(suppliersResult.data);
        }
        if (materialsResult.success && materialsResult.data) {
            setMaterials(materialsResult.data);
        }
        if (recipientsResult.success && recipientsResult.data) {
            setRecipients(recipientsResult.data);
        }
        setIsLoadingDropdowns(false);
    }, []);

    // Load item data for editing
    const loadItemData = useCallback(async () => {
        if (!item) return;

        setIsLoading(true);
        const result = await ItemManager.getById(item.id);
        if (result.success && result.data) {
            const itemData = result.data.data;
            setFormData(ItemManager.toFormData(itemData));

            // Save original supplier for pinned item
            if (itemData.supplier_id && itemData.supplier) {
                setOriginalSupplier({
                    id: itemData.supplier_id,
                    name: itemData.supplier.name,
                    item: {
                        id: itemData.id,
                        name: itemData.name,
                    },
                });
            }
        } else {
            showError(result.error || t("errors.generic"));
            onClose();
        }
        setIsLoading(false);
    }, [item, t, onClose]);

    useEffect(() => {
        if (isOpen) {
            // In edit mode, pass item's supplier_id to ensure it appears first in dropdown
            loadDropdownData(isEditing ? item?.supplier_id : undefined);
            if (isEditing) {
                loadItemData();
            } else {
                setFormData(ItemManager.getDefaultFormData());
                setOriginalSupplier(null);
            }
            setErrors({});
            setMaterialSearch("");
            setRecipientSearch("");
        } else {
            setOriginalSupplier(null);
        }
    }, [isOpen, isEditing, item?.supplier_id, loadDropdownData, loadItemData]);

    const handleChange = (field: keyof ItemFormData, value: ItemFormData[keyof ItemFormData]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleMaterialToggle = (materialId: number) => {
        setFormData((prev) => ({
            ...prev,
            material_ids: prev.material_ids.includes(materialId)
                ? prev.material_ids.filter((id) => id !== materialId)
                : [...prev.material_ids, materialId],
        }));
    };

    const handleRecipientToggle = (recipientId: number) => {
        setFormData((prev) => ({
            ...prev,
            recipient_ids: prev.recipient_ids.includes(recipientId)
                ? prev.recipient_ids.filter((id) => id !== recipientId)
                : [...prev.recipient_ids, recipientId],
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("validation.required");
        }
        if (!formData.reference.trim()) {
            newErrors.reference = t("validation.required");
        }
        if (formData.current_price !== null && formData.current_price < 0) {
            newErrors.current_price = t("validation.min", { min: 0 });
        }
        if (formData.number_warning_enabled && formData.number_warning_minimum < 0) {
            newErrors.number_warning_minimum = t("validation.min", { min: 0 });
        }
        if (formData.number_critical_enabled && formData.number_critical_minimum < 0) {
            newErrors.number_critical_minimum = t("validation.min", { min: 0 });
        }
        if (
            formData.number_warning_enabled &&
            formData.number_critical_enabled &&
            formData.number_critical_minimum >= formData.number_warning_minimum
        ) {
            newErrors.number_critical_minimum = t("items.validation.criticalLessThanWarning");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        const result = isEditing
            ? await ItemManager.update(item!.id, formData)
            : await ItemManager.create(formData);

        if (result.success) {
            showSuccess(
                isEditing
                    ? t("items.messages.updated", { name: formData.name })
                    : t("items.messages.created", { name: formData.name })
            );
            onSuccess();
            onClose();
        } else {
            showError(result.error || t("errors.generic"));
        }

        setIsLoading(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-2xl"
        >
            <div className="p-6">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
                    {isEditing ? t("items.edit") : t("items.create")}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("items.sections.basicInfo")}
                        </h4>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="name">{t("items.fields.name")} *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    error={!!errors.name}
                                    hint={errors.name}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="reference">{t("items.fields.reference")} *</Label>
                                <Input
                                    id="reference"
                                    value={formData.reference}
                                    onChange={(e) => handleChange("reference", e.target.value)}
                                    error={!!errors.reference}
                                    hint={errors.reference}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">{t("items.fields.description")}</Label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={3}
                                disabled={isLoading}
                                placeholder={t("items.fields.description")}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("items.sections.pricing")}
                        </h4>

                        <div>
                            <Label htmlFor="current_price">{t("items.fields.purchasePrice")}</Label>
                            <Input
                                id="current_price"
                                type="number"
                                step={0.01}
                                min="0"
                                value={formData.current_price ?? ""}
                                onChange={(e) =>
                                    handleChange("current_price", e.target.value ? parseFloat(e.target.value) : null)
                                }
                                error={!!errors.current_price}
                                hint={errors.current_price}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Supplier */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("items.sections.supplier")}
                        </h4>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label>{t("items.fields.supplier")}</Label>
                                <SearchableDropdown
                                    value={formData.supplier_id}
                                    onChange={(value) => handleChange("supplier_id", value)}
                                    options={suppliers}
                                    placeholder={t("items.form.selectSupplier")}
                                    searchPlaceholder={t("items.form.searchSupplier")}
                                    noSelectionText={t("items.noSupplier")}
                                    noResultsText={t("common.noResults")}
                                    loadingText={t("common.loading")}
                                    nullable
                                    disabled={isLoading}
                                    isLoading={isLoadingDropdowns || isLoadingSuppliers}
                                    onSearch={searchSuppliers}
                                    pinnedItem={originalSupplier ? {
                                        id: originalSupplier.id,
                                        name: originalSupplier.name,
                                        label: t("items.form.currentSupplier"),
                                    } as PinnedItem : undefined}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="supplier_reference">{t("items.fields.supplierReference")}</Label>
                                <Input
                                    id="supplier_reference"
                                    value={formData.supplier_reference}
                                    onChange={(e) => handleChange("supplier_reference", e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Alerts */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("items.sections.stockAlerts")}
                        </h4>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <Checkbox
                                    id="number_warning_enabled"
                                    checked={formData.number_warning_enabled}
                                    onChange={(checked) => handleChange("number_warning_enabled", checked)}
                                    disabled={isLoading}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="number_warning_enabled" className="mb-0!">
                                        {t("items.alerts.enableWarning")}
                                    </Label>
                                    {formData.number_warning_enabled && (
                                        <div className="mt-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.number_warning_minimum}
                                                onChange={(e) =>
                                                    handleChange("number_warning_minimum", parseInt(e.target.value) || 0)
                                                }
                                                error={!!errors.number_warning_minimum}
                                                hint={errors.number_warning_minimum}
                                                disabled={isLoading}
                                                className="max-w-[150px]"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {t("items.alerts.warningThresholdHelp")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Checkbox
                                    id="number_critical_enabled"
                                    checked={formData.number_critical_enabled}
                                    onChange={(checked) => handleChange("number_critical_enabled", checked)}
                                    disabled={isLoading}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="number_critical_enabled" className="mb-0!">
                                        {t("items.alerts.enableCritical")}
                                    </Label>
                                    {formData.number_critical_enabled && (
                                        <div className="mt-2 space-y-4">
                                            <div>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={formData.number_critical_minimum}
                                                    onChange={(e) =>
                                                        handleChange("number_critical_minimum", parseInt(e.target.value) || 0)
                                                    }
                                                    error={!!errors.number_critical_minimum}
                                                    hint={errors.number_critical_minimum}
                                                    disabled={isLoading}
                                                    className="max-w-[150px]"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {t("items.alerts.criticalThresholdHelp")}
                                                </p>
                                            </div>

                                            {/* Recipients for critical alerts */}
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <Label className="mb-1">{t("items.sections.recipients")}</Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    {t("items.recipientsHelp")}
                                                </p>

                                                <div className="space-y-2">
                                                    <Input
                                                        type="text"
                                                        placeholder={t("common.search")}
                                                        value={recipientSearch}
                                                        onChange={(e) => handleRecipientSearch(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                                        {isLoadingDropdowns || isLoadingRecipients ? (
                                                            <div className="text-sm text-gray-500 p-1">{t("common.loading")}</div>
                                                        ) : recipients.length === 0 ? (
                                                            <div className="text-sm text-gray-500 p-1">
                                                                {recipientSearch ? t("common.noResults") : t("items.noRecipientsAvailable")}
                                                            </div>
                                                        ) : (
                                                            recipients.map((recipient) => (
                                                                <label
                                                                    key={recipient.id}
                                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                                                >
                                                                    <Checkbox
                                                                        checked={formData.recipient_ids.includes(recipient.id)}
                                                                        onChange={() => handleRecipientToggle(recipient.id)}
                                                                        disabled={isLoading}
                                                                    />
                                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                        {recipient.full_name}
                                                                        <span className="text-xs text-gray-500 ml-1">
                                                                            ({recipient.email})
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Materials */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("items.sections.materials")}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("items.materialsHelp")}
                        </p>

                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder={t("common.search")}
                                value={materialSearch}
                                onChange={(e) => handleMaterialSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                {isLoadingDropdowns || isLoadingMaterials ? (
                                    <div className="text-sm text-gray-500 col-span-2 p-1">{t("common.loading")}</div>
                                ) : materials.length === 0 ? (
                                    <div className="text-sm text-gray-500 col-span-2 p-1">
                                        {materialSearch ? t("common.noResults") : t("items.noMaterialsAvailable")}
                                    </div>
                                ) : (
                                    materials.map((material) => (
                                        <label
                                            key={material.id}
                                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                        >
                                            <Checkbox
                                                checked={formData.material_ids.includes(material.id)}
                                                onChange={() => handleMaterialToggle(material.id)}
                                                disabled={isLoading}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {material.name}
                                                {material.zone && (
                                                    <span className="text-xs text-gray-500 ml-1">
                                                        ({material.zone.name})
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading
                                ? t("common.saving")
                                : isEditing
                                    ? t("common.save")
                                    : t("common.create")}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
