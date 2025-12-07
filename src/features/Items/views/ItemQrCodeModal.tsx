import type { FC } from "react";
import { QrCodeModal } from "@/features/Qrcode/views";
import { ItemManager } from "../services";
import type { Item } from "../types";

interface ItemQrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Item | null;
}

/**
 * QR Code modal specifically for Items
 * Uses the shared QrCodeModal component with Item-specific configuration
 */
export const ItemQrCodeModal: FC<ItemQrCodeModalProps> = ({ isOpen, onClose, item }) => {
    // Convert Item to QrCodeEntity format
    const entity = item ? {
        id: item.id,
        name: item.name,
        reference: item.reference,
    } : null;

    return (
        <QrCodeModal
            isOpen={isOpen}
            onClose={onClose}
            entity={entity}
            fetchQrCode={ItemManager.getQrCode}
            translationPrefix="items"
        />
    );
};
