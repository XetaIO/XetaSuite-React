import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import Alert from '../ui/alert/Alert';

export default function SignInForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get success message from password reset
    const successMessage = (location.state as { message?: string })?.message;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({ email, password, remember });

            // Redirect to the page user tried to access, or dashboard
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {t('auth.signInToAccount')}
            </h2>

            {successMessage && (
                <Alert variant="success" className="mb-4" message={successMessage} />
            )}

            {error && (
                <Alert variant="error" className="mb-4" message={error} />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label>
                        {t('auth.email')} <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.emailPlaceholder')}
                        required
                        autoComplete="email"
                        autoFocus
                    />
                </div>

                <div>
                    <Label>
                        {t('auth.password')} <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder={t('auth.passwordPlaceholder')}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                            {showPassword ? (
                                <FaEye className="fill-gray-500 dark:fill-gray-400 size-5" />
                            ) : (
                                <FaEyeSlash className="fill-gray-500 dark:fill-gray-400 size-5" />
                            )}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Checkbox checked={remember} onChange={setRemember} />
                        <span className="block font-normal text-gray-700 text-sm dark:text-gray-400">
                            {t('auth.rememberMe')}
                        </span>
                    </div>

                    <Link
                        to="/auth/forgot-password"
                        className="text-sm font-medium text-brand-600 hover:text-brand-500"
                    >
                        {t('auth.forgotPassword')}
                    </Link>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading ? t('auth.signingIn') : t('auth.loginButton')}
                </Button>
            </form>
        </div>
    );
}