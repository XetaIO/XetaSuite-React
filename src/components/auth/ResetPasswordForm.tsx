import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Alert from '../ui/alert/Alert';

export default function ResetPasswordForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();

    const token = searchParams.get('token') || '';
    const emailFromUrl = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromUrl);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        setIsLoading(true);

        try {
            await resetPassword({
                email,
                password,
                password_confirmation: passwordConfirmation,
                token,
            });

            // Redirect to login with success message
            navigate('/auth/login', {
                state: { message: t('auth.passwordResetSuccess') },
                replace: true,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    // Show error if token is missing
    if (!token) {
        return (
            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    {t('auth.resetPasswordTitle')}
                </h2>
                <Alert
                    variant="error"
                    title={t('auth.invalidLink')}
                    message={t('auth.invalidLinkDesc')}
                />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {t('auth.resetPasswordTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('auth.resetPasswordDesc')}
            </p>

            {error && (
                <Alert variant="error" message={error} className="mb-4" />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label htmlFor="email">
                        {t('auth.email')} <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.emailPlaceholder')}
                        required
                        autoComplete="email"
                    />
                </div>

                <div>
                    <Label htmlFor="password">
                        {t('auth.newPassword')} <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder={t('auth.newPasswordPlaceholder')}
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
                    {isLoading ? t('auth.resetting') : t('auth.resetPassword')}
                </Button>
            </form>
        </div>
    );
}
