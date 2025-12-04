import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "@/shared/components/ui";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    title: string;
    message: string;
}

const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    title,
    message,
}) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10">
                    <svg
                        className="h-6 w-6 text-error-600 dark:text-error-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                <div className="flex justify-center gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
                        {t("common.delete")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmModal;
