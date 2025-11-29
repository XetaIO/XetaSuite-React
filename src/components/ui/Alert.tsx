import { type ReactNode } from 'react';
import clsx from 'clsx';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const icons = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationCircleIcon,
  error: XCircleIcon,
};

const styles = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

const iconStyles = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border',
        styles[variant],
        className
      )}
      role="alert"
    >
      <Icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[variant])} />
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default Alert;
