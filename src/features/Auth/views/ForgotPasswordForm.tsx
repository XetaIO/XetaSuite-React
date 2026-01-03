import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FaAngleLeft } from "react-icons/fa6";
import { useAuth } from '../hooks';
import { useRecaptcha } from '@/shared/hooks';
import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import Alert from '@/shared/components/ui/alert/Alert';

export default function ForgotPasswordForm() {
    const { t } = useTranslation();
    const { forgotPassword } = useAuth();
    const { executeRecaptcha } = useRecaptcha();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsLoading(true);

        try {
            const recaptchaToken = await executeRecaptcha('forgot_password');
            await forgotPassword({ email, recaptcha_token: recaptchaToken });
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

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
                {t('auth.forgotPasswordTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('auth.forgotPasswordDesc')}
            </p>

            {success ? (
                <Alert
                    variant="success"
                    title={t('auth.emailSent')}
                    message={t('auth.emailSentDesc')}
                />
            ) : (
                <>
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
                                autoFocus
                                error={!!error}
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
                        </Button>
                    </form>
                </>
            )}
        </div>
    );
}
