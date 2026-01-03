import { useTranslation } from "react-i18next";
import { PageMeta } from "@/shared/components/common";
import { NotFoundContent } from "@/shared/components/errors";

/**
 * 404 page for use within the authenticated layout
 * Displays the NotFoundContent component within the app layout
 */
export default function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <>
            <PageMeta
                title={`${t("errors.notFound")} | XetaSuite`}
                description={t("errors.pageNotFound")}
            />
            <NotFoundContent />
        </>
    );
}
