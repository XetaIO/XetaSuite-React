import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts';
import { Button, Input, Alert } from '@/components/ui';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

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
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Check your email
        </h2>
        
        <Alert variant="success" className="mb-6">
          We have sent a password reset link to <strong>{email}</strong>. 
          Please check your inbox and follow the instructions to reset your password.
        </Alert>

        <p className="text-sm text-slate-600 mb-6">
          Didn't receive the email? Check your spam folder or try again with a different email address.
        </p>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
          >
            Try again
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Forgot your password?
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        No worries! Enter your email address and we'll send you a link to reset your password.
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
          autoFocus
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
