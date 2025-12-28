import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FaAngleLeft, FaEye, FaEyeSlash } from "react-icons/fa6";
import { AuthRepository } from '../services/AuthRepository';
import type { SetupPasswordVerifyResponse } from '../types';
import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import Alert from '@/shared/components/ui/alert/Alert';

export default function SetupPasswordForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id, hash } = useParams<{ id: string; hash: string }>();
    const [searchParams] = useSearchParams();

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [verifyData, setVerifyData] = useState<SetupPasswordVerifyResponse | null>(null);

    // Build query string from search params (contains signature & expires)
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

    useEffect(() => {
        const verifyLink = async () => {
            if (!id || !hash) {
                setVerifyData({ valid: false, message: t('auth.setupPassword.invalidLink') });
                setIsVerifying(false);
                return;
            }

            try {
                const response = await AuthRepository.verifySetupPassword(
                    parseInt(id, 10),
                    hash,
                    queryString
                );
                setVerifyData(response);
            } catch (err) {
                // Extract error message from API response
                const errorMessage = (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || t('auth.setupPassword.invalidLink');
                setVerifyData({ valid: false, message: errorMessage });
            } finally {
                setIsVerifying(false);
            }
        };

        verifyLink();
    }, [id, hash, queryString, t]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        if (password.length < 8) {
            setError(t('auth.passwordMinLength'));
            return;
        }

        if (!id || !hash) {
            setError(t('auth.setupPassword.invalidLink'));
            return;
        }

        setIsLoading(true);

        try {
            await AuthRepository.setupPassword(
                parseInt(id, 10),
                hash,
                queryString,
                {
                    password,
                    password_confirmation: passwordConfirmation,
                }
            );

            navigate('/auth/login', {
                state: { message: t('auth.setupPassword.success') },
                replace: true,
            });
        } catch (err) {
            const errorMessage = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || t('errors.generic');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state while verifying
    if (isVerifying) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {t('auth.setupPassword.verifying')}
                </p>
            </div>
        );
    }

    // Invalid link state
    if (!verifyData?.valid) {
        return (
            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    {t('auth.setupPassword.title')}
                </h2>
                <Alert
                    variant="error"
                    title={t('auth.setupPassword.linkError')}
                    message={verifyData?.message || t('auth.setupPassword.invalidLink')}
                />
                <div className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/auth/login')}
                        fullWidth
                    >
                        {t('auth.backToSignIn')}
                    </Button>
                </div>
            </div>
        );
    }

    // Valid link - show form
    return (
        <div>
            <Link
                to="/auth/login"
                className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6"
            >
                <FaAngleLeft className="size-5" />
                {t('auth.backToSignIn')}
            </Link>

            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {t('auth.setupPassword.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('auth.setupPassword.desc', { name: verifyData.user?.full_name })}
            </p>

            {error && (
                <Alert variant="error" message={error} className="mb-4" />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={verifyData.user?.email || ''}
                        disabled
                        autoComplete="email"
                        className="bg-gray-100 dark:bg-gray-800"
                    />
                </div>

                <div>
                    <Label htmlFor="password">
                        {t('auth.password')} <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder={t('auth.setupPassword.passwordPlaceholder')}
                            required
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={!!error}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <FaEye className="fill-gray-500 dark:fill-gray-400 size-5" />
                            ) : (
                                <FaEyeSlash className="fill-gray-500 dark:fill-gray-400 size-5" />
                            )}
                        </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {t('auth.passwordMinLengthHint')}
                    </p>
                </div>

                <div>
                    <Label htmlFor="password_confirmation">
                        {t('auth.confirmPassword')} <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPasswordConfirmation ? "text" : "password"}
                            id="password_confirmation"
                            name="password_confirmation"
                            placeholder={t('auth.confirmPasswordPlaceholder')}
                            required
                            autoComplete="new-password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            error={!!error}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            tabIndex={-1}
                        >
                            {showPasswordConfirmation ? (
                                <FaEye className="fill-gray-500 dark:fill-gray-400 size-5" />
                            ) : (
                                <FaEyeSlash className="fill-gray-500 dark:fill-gray-400 size-5" />
                            )}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading ? t('auth.setupPassword.creating') : t('auth.setupPassword.create')}
                </Button>
            </form>
        </div>
    );
}
