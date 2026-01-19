import { useState, type FC, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaKey, FaEye, FaEyeSlash } from "react-icons/fa6";
import { PageMeta } from "@/shared/components/common";
import { Button } from "@/shared/components/ui";
import { Label, Input } from "@/shared/components/form";
import { showSuccess, showError } from "@/shared/utils";
import { AccountManager } from "../services";
import type { UpdatePasswordData } from "../types";

const ChangePasswordPage: FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<UpdatePasswordData>({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await AccountManager.updatePassword(formData);

        if (result.success) {
            showSuccess(t("account.password.success"));
            setFormData({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
        } else {
            if (result.error) {
                showError(result.error);
            } else {
                showError(t("errors.generic"));
            }
        }

        setIsLoading(false);
    };

    return (
        <>
            <PageMeta title={t("account.password.pageTitle")} description={t("account.password.description")} />

            <div className="bg-white rounded-xl border border-gray-200 dark:bg-white/3 dark:border-white/5">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20">
                            <FaKey className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                                {t("account.password.pageTitle")}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("account.password.description")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="max-w-md space-y-6">
                        {/* Current Password */}
                        <div>
                            <Label htmlFor="current_password">
                                {t("account.password.currentPassword")} <span className="text-error-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    name="current_password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <Label htmlFor="password">
                                {t("account.password.newPassword")} <span className="text-error-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                {t("account.password.requirements")}
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <Label htmlFor="password_confirmation">
                                {t("account.password.confirmPassword")} <span className="text-error-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                            >
                                {isLoading ? t("common.loading") : t("account.password.submit")}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChangePasswordPage;
