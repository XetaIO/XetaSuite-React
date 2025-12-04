import { useState, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowRightToBracket, FaArrowRightFromBracket } from "react-icons/fa6";
import { Modal, Button } from "@/shared/components/ui";
import { Input, Label, Select } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { ItemManager } from "../services";
import type { Item, ItemMovementFormData, AvailableSupplier, MovementType } from "../types";

interface ItemMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Item | null;
    type: MovementType;
    onSuccess: () => void;
}

export const ItemMovementModal: FC<ItemMovementModalProps> = ({
    isOpen,
    onClose,
    item,
    type,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const isEntry = type === "entry";

    const [formData, setFormData] = useState<ItemMovementFormData>({
        type,
        quantity: 1,
        unit_price: undefined,
        supplier_id: undefined,
        supplier_invoice_number: "",
        invoice_date: "",
        notes: "",
        movement_date: new Date().toISOString().split("T")[0],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [suppliers, setSuppliers] = useState<AvailableSupplier[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Reset form with new type
            setFormData({
                type,
                quantity: 1,
                unit_price: isEntry ? undefined : undefined,
                supplier_id: isEntry ? item?.supplier_id || undefined : undefined,
                supplier_invoice_number: "",
                invoice_date: "",
                notes: "",
                movement_date: new Date().toISOString().split("T")[0],
            });
            setErrors({});

            // Load suppliers for entry
            if (isEntry) {
                ItemManager.getAvailableSuppliers().then((result) => {
                    if (result.success && result.data) {
                        setSuppliers(result.data);
                    }
                });
            }
        }
    }, [isOpen, type, isEntry, item?.supplier_id]);

    const handleChange = (
        field: keyof ItemMovementFormData,
        value: string | number | undefined
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = t("items.movements.validation.quantityRequired");
        }

        // For exit, check we don't exceed current stock
        if (!isEntry && item && formData.quantity > item.current_stock) {
            newErrors.quantity = t("items.movements.validation.insufficientStock", {
                available: item.current_stock,
            });
        }

        if (isEntry && formData.unit_price !== undefined && formData.unit_price < 0) {
            newErrors.unit_price = t("validation.min", { min: 0 });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!item || !validate()) return;

        setIsLoading(true);

        const result = await ItemManager.createMovement(item.id, formData);

        if (result.success) {
            showSuccess(
                isEntry
                    ? t("items.movements.messages.entryCreated", { quantity: formData.quantity })
                    : t("items.movements.messages.exitCreated", { quantity: formData.quantity })
            );
            onSuccess();
            onClose();
        } else {
            showError(result.error || t("errors.generic"));
        }

        setIsLoading(false);
    };

    if (!item) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
            {/* Title */}
            <div className="flex items-center gap-3 mb-6">
                {isEntry ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
                        <FaArrowRightToBracket className="h-5 w-5 text-success-600" />
                    </div>
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10">
                        <FaArrowRightFromBracket className="h-5 w-5 text-error-600" />
                    </div>
                )}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {isEntry ? t("items.movements.addEntry") : t("items.movements.addExit")}
                </h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item info */}
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                                {item.name}
                            </h4>
                            {item.reference && (
                                <p className="text-sm text-gray-500">{item.reference}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">{t("items.fields.currentStock")}</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {item.current_stock}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quantity */}
                <div>
                    <Label htmlFor="quantity">
                        {t("items.movements.fields.quantity")} *
                    </Label>
                    <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={isEntry ? undefined : String(item.current_stock)}
                        value={formData.quantity}
                        onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                        error={!!errors.quantity}
                        hint={errors.quantity}
                        disabled={isLoading}
                    />
                    {!isEntry && (
                        <p className="mt-1 text-xs text-gray-500">
                            {t("items.movements.availableStock", { count: item.current_stock })}
                        </p>
                    )}
                </div>

                {/* Entry-specific fields */}
                {isEntry && (
                    <>
                        {/* Unit price */}
                        <div>
                            <Label htmlFor="unit_price">{t("items.movements.fields.unitPrice")}</Label>
                            <Input
                                id="unit_price"
                                type="number"
                                step={0.01}
                                min="0"
                                value={formData.unit_price ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "unit_price",
                                        e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                }
                                error={!!errors.unit_price}
                                hint={errors.unit_price}
                                disabled={isLoading}
                            />
                            {formData.unit_price && formData.quantity > 0 && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t("items.movements.totalPrice")}:{" "}
                                    <span className="font-semibold">
                                        {ItemManager.formatCurrency(
                                            formData.unit_price * formData.quantity,
                                            item.currency
                                        )}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Supplier */}
                        <div>
                            <Label htmlFor="supplier_id">{t("items.movements.fields.supplier")}</Label>
                            <Select
                                options={[
                                    { value: "", label: t("items.noSupplier") },
                                    ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
                                ]}
                                defaultValue={formData.supplier_id ? String(formData.supplier_id) : ""}
                                onChange={(value) =>
                                    handleChange("supplier_id", value ? parseInt(value) : undefined)
                                }
                            />
                        </div>

                        {/* Invoice fields */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="supplier_invoice_number">
                                    {t("items.movements.fields.invoiceNumber")}
                                </Label>
                                <Input
                                    id="supplier_invoice_number"
                                    value={formData.supplier_invoice_number || ""}
                                    onChange={(e) =>
                                        handleChange("supplier_invoice_number", e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="invoice_date">
                                    {t("items.movements.fields.invoiceDate")}
                                </Label>
                                <Input
                                    id="invoice_date"
                                    type="date"
                                    value={formData.invoice_date || ""}
                                    onChange={(e) => handleChange("invoice_date", e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Movement date */}
                <div>
                    <Label htmlFor="movement_date">{t("items.movements.fields.date")}</Label>
                    <Input
                        id="movement_date"
                        type="date"
                        value={formData.movement_date || ""}
                        onChange={(e) => handleChange("movement_date", e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                {/* Notes */}
                <div>
                    <Label htmlFor="notes">{t("items.movements.fields.notes")}</Label>
                    <textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        rows={3}
                        disabled={isLoading}
                        placeholder={t("items.movements.fields.notes")}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        variant={isEntry ? "primary" : "primary"}
                        disabled={isLoading}
                        className={isEntry ? "" : "bg-error-500 hover:bg-error-600"}
                    >
                        {isLoading
                            ? t("common.saving")
                            : isEntry
                                ? t("items.movements.confirmEntry")
                                : t("items.movements.confirmExit")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
