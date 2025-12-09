import { useState, useRef, useEffect, type FC, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    FaEllipsisVertical,
    FaPenToSquare,
    FaTrash,
    FaQrcode,
    FaArrowRightToBracket,
    FaArrowRightFromBracket,
    FaEye,
} from "react-icons/fa6";

export interface ActionItem {
    key: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: "default" | "success" | "danger";
    disabled?: boolean;
    hidden?: boolean;
}

interface ActionsDropdownProps {
    actions: ActionItem[];
    align?: "left" | "right";
}

export const ActionsDropdown: FC<ActionsDropdownProps> = ({
    actions,
    align = "right",
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const visibleActions = actions.filter((action) => !action.hidden);

    if (visibleActions.length === 0) return null;

    const getVariantClasses = (variant?: "default" | "success" | "danger") => {
        switch (variant) {
            case "success":
                return "text-success-600 hover:bg-success-50 dark:text-success-400 dark:hover:bg-success-500/10";
            case "danger":
                return "text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10";
            default:
                return "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700";
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                title={t("common.actions")}
            >
                <FaEllipsisVertical className="h-4 w-4" />
            </button>

            {isOpen && (
                <div
                    className={`absolute z-50 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${align === "right" ? "right-0" : "left-0"
                        }`}
                >
                    {visibleActions.map((action) => (
                        <button
                            key={action.key}
                            onClick={() => {
                                if (!action.disabled) {
                                    action.onClick();
                                    setIsOpen(false);
                                }
                            }}
                            disabled={action.disabled}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${action.disabled
                                ? "cursor-not-allowed opacity-50"
                                : getVariantClasses(action.variant)
                                }`}
                        >
                            <span className="shrink-0">{action.icon}</span>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper to create common action items for Items
export const createItemActions = {
    view: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "view",
        label: t("common.view"),
        icon: <FaEye className="h-4 w-4" />,
        onClick,
    }),
    edit: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "edit",
        label: t("common.edit"),
        icon: <FaPenToSquare className="h-4 w-4" />,
        onClick,
    }),
    delete: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "delete",
        label: t("common.delete"),
        icon: <FaTrash className="h-4 w-4" />,
        onClick,
        variant: "danger",
    }),
    qrCode: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "qrCode",
        label: t("items.qrCode.title"),
        icon: <FaQrcode className="h-4 w-4" />,
        onClick,
    }),
    stockEntry: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "stockEntry",
        label: t("items.movements.addEntry"),
        icon: <FaArrowRightToBracket className="h-4 w-4" />,
        onClick,
        variant: "success",
    }),
    stockExit: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "stockExit",
        label: t("items.movements.addExit"),
        icon: <FaArrowRightFromBracket className="h-4 w-4" />,
        onClick,
        variant: "danger",
    }),
};


export const createMaterialActions = {
    view: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "view",
        label: t("common.view"),
        icon: <FaEye className="h-4 w-4" />,
        onClick,
    }),
    edit: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "edit",
        label: t("common.edit"),
        icon: <FaPenToSquare className="h-4 w-4" />,
        onClick,
    }),
    delete: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "delete",
        label: t("common.delete"),
        icon: <FaTrash className="h-4 w-4" />,
        onClick,
        variant: "danger",
    }),
    qrCode: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "qrCode",
        label: t("materials.qrCode.title"),
        icon: <FaQrcode className="h-4 w-4" />,
        onClick,
    }),
};

// Helper to create common action items for Incidents
export const createIncidentActions = {
    view: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "view",
        label: t("common.view"),
        icon: <FaEye className="h-4 w-4" />,
        onClick,
    }),
    edit: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "edit",
        label: t("common.edit"),
        icon: <FaPenToSquare className="h-4 w-4" />,
        onClick,
    }),
    delete: (onClick: () => void, t: (key: string) => string): ActionItem => ({
        key: "delete",
        label: t("common.delete"),
        icon: <FaTrash className="h-4 w-4" />,
        onClick,
        variant: "danger",
    }),
};
