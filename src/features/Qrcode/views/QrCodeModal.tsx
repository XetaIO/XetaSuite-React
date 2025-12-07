import { useState, useEffect, useCallback, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import { FaDownload, FaPrint, FaSpinner } from "react-icons/fa6";
import { Modal, Button } from "@/shared/components/ui";

/**
 * Entity interface for QR code modal
 * Can be an Item, Material, or any entity with id, name, and optional reference
 */
export interface QrCodeEntity {
    id: number;
    name: string;
    reference?: string | null;
}

/**
 * Function type for fetching QR code data
 */
export type QrCodeFetcher = (id: number, size: number) => Promise<{
    success: boolean;
    data?: { svg: string; url: string; size: number };
    error?: string;
}>;

interface QrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    entity: QrCodeEntity | null;
    fetchQrCode: QrCodeFetcher;
    /**
     * Translation key prefix for the modal title and help text
     * e.g., "items" will use "items.qrCode.title", "items.qrCode.help", etc.
     */
    translationPrefix: string;
}

type QrCodeSize = 100 | 150 | 200 | 300 | 400;

/**
 * Reusable QR Code Modal component
 * Can be used for Items, Materials, or any entity that needs QR code functionality
 */
export const QrCodeModal: FC<QrCodeModalProps> = ({
    isOpen,
    onClose,
    entity,
    fetchQrCode,
    translationPrefix,
}) => {
    const { t } = useTranslation();
    const [size, setSize] = useState<QrCodeSize>(200);
    const [svgContent, setSvgContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const sizeOptions: { value: string; label: string }[] = [
        { value: "100", label: "100 x 100 px" },
        { value: "150", label: "150 x 150 px" },
        { value: "200", label: "200 x 200 px" },
        { value: "300", label: "300 x 300 px" },
        { value: "400", label: "400 x 400 px" },
    ];

    const loadQrCode = useCallback(async () => {
        if (!entity) return;

        setIsLoading(true);
        setError(null);

        const result = await fetchQrCode(entity.id, size);
        if (result.success && result.data) {
            setSvgContent(result.data.svg);
        } else {
            setError(result.error || t("errors.generic"));
        }

        setIsLoading(false);
    }, [entity, size, fetchQrCode, t]);

    useEffect(() => {
        if (isOpen && entity) {
            loadQrCode();
        }
    }, [isOpen, entity, loadQrCode]);

    const handleSizeChange = (value: string) => {
        setSize(parseInt(value) as QrCodeSize);
    };

    const handleDownload = () => {
        if (!svgContent || !entity) return;

        // Create a blob from the SVG content
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `qrcode-${entity.reference || entity.id}-${size}px.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        if (!svgContent || !entity) return;

        // Create a new window for printing
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t(`${translationPrefix}.qrCode.printTitle`, { name: entity.name })}</title>
                <style>
                    body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        font-family: system-ui, -apple-system, sans-serif;
                    }
                    .entity-info {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .entity-name {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .entity-reference {
                        font-size: 14px;
                        color: #666;
                    }
                    .qr-container {
                        display: flex;
                        justify-content: center;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="entity-info">
                    <div class="entity-name">${entity.name}</div>
                    ${entity.reference ? `<div class="entity-reference">${entity.reference}</div>` : ""}
                </div>
                <div class="qr-container">
                    ${svgContent}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (!entity) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            <div className="p-6">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white text-center">
                    {t(`${translationPrefix}.qrCode.title`)}
                </h3>
                <div className="space-y-6">
                    {/* Entity info */}
                    <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                            {entity.name}
                        </h4>
                        {entity.reference && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {entity.reference}
                            </p>
                        )}
                    </div>

                    {/* Size selector */}
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t(`${translationPrefix}.qrCode.size`)}:
                        </span>
                        <select
                            value={String(size)}
                            onChange={(e) => handleSizeChange(e.target.value)}
                            title={t(`${translationPrefix}.qrCode.size`)}
                            className="h-11 w-40 appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                        >
                            {sizeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* QR Code display */}
                    <div
                        ref={qrContainerRef}
                        className="flex items-center justify-center min-h-[250px] bg-white rounded-lg p-4"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <FaSpinner className="h-5 w-5 animate-spin" />
                                <span>{t("common.loading")}</span>
                            </div>
                        ) : error ? (
                            <div className="text-center text-error-500">
                                <p>{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadQrCode}
                                    className="mt-2"
                                >
                                    {t("common.retry")}
                                </Button>
                            </div>
                        ) : (
                            <div
                                dangerouslySetInnerHTML={{ __html: svgContent }}
                                className="qr-code-container"
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-3">
                        <Button
                            variant="outline"
                            startIcon={<FaDownload className="h-4 w-4" />}
                            onClick={handleDownload}
                            disabled={isLoading || !!error}
                        >
                            {t(`${translationPrefix}.qrCode.download`)}
                        </Button>
                        <Button
                            variant="outline"
                            startIcon={<FaPrint className="h-4 w-4" />}
                            onClick={handlePrint}
                            disabled={isLoading || !!error}
                        >
                            {t(`${translationPrefix}.qrCode.print`)}
                        </Button>
                    </div>

                    {/* Help text */}
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        {t(`${translationPrefix}.qrCode.help`)}
                    </p>
                </div>
            </div>
        </Modal>
    );
};
