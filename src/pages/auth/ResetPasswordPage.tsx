import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Button, Input, Alert } from '@/components/ui';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
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
      navigate('/login', {
        state: { message: 'Your password has been reset successfully. Please sign in with your new password.' },
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Invalid Reset Link
        </h2>
        <Alert variant="error" className="mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </Alert>
        <Button
          type="button"
          fullWidth
          onClick={() => navigate('/forgot-password')}
        >
          Request new link
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Reset your password
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Enter your new password below.
      </p>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />

        <Input
          label="New password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
          autoComplete="new-password"
          helperText="Must be at least 8 characters"
        />

        <Input
          label="Confirm password"
          type="password"
          name="password_confirmation"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Confirm new password"
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Reset password
        </Button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
