import type { FC } from 'react';
import { QrCodeModal } from '@/features/Qrcode/views';
import { MaterialManager } from '../services';
import type { Material, MaterialDetail } from '../types';

interface MaterialQrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: Material | MaterialDetail | null;
}

const fetchQrCode = async (id: number, size: number) => MaterialManager.getQrCode(id, size);

export const MaterialQrCodeModal: FC<MaterialQrCodeModalProps> = ({
    isOpen,
    onClose,
    material,
}) => {
    if (!material) return null;

    return (
        <QrCodeModal
            isOpen={isOpen}
            onClose={onClose}
            entity={{ id: material.id, name: material.name }}
            fetchQrCode={fetchQrCode}
            translationPrefix="materials"
        />
    );
};
