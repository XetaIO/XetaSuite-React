import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { FaLock, FaArrowLeft } from "react-icons/fa6";

export default function UnauthorizedPage() {
    const { t } = useTranslation();

    return (
        <>
            <PageMeta
                title={`${t('errors.unauthorized')} | XetaSuite`}
                description={t('errors.unauthorizedDescription')}
            />
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-100 dark:bg-error-500/20">
                    <FaLock className="h-10 w-10 text-error-600 dark:text-error-400" />
                </div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
                    403
                </h1>
                <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                    {t('errors.unauthorized')}
                </h2>
                <p className="mb-8 max-w-md text-gray-500 dark:text-gray-400">
                    {t('errors.unauthorizedDescription')}
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                    <FaArrowLeft className="h-4 w-4" />
                    {t('errors.backToDashboard')}
                </Link>
            </div>
        </>
    );
}
