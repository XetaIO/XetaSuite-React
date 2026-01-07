import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { FaShieldHalved } from "react-icons/fa6";
import { PageMeta } from "@/shared/components/common";

const SecurityPage: FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <PageMeta title={t("account.security.pageTitle")} description={t("account.security.pageDescription")} />

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20">
                            <FaShieldHalved className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                                {t("account.security.pageTitle")}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("account.security.pageDescription")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content - Coming Soon */}
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-6xl mb-4">
                            <FaShieldHalved className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                            {t("common.comingSoon")}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">
                            {t("account.security.comingSoonDescription")}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SecurityPage;
