type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
export type BadgeColor =
  | "brand"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  title?: string; // Tooltip text
  extraClass?: string; // Additional CSS classes
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
}

const Badge: React.FC<BadgeProps> = ({
  title,
  extraClass,
  variant = "light",
  color = "brand",
  size = "sm",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  // Define size styles
  const sizeStyles = {
    sm: "text-sm", // Smaller padding and font size
    md: "text-md", // Default padding and font size
  };

  // Define color styles for variants
  const variants = {
    light: {
      brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
      success: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
      error: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
      warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-orange-400",
      info: "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/10 dark:text-blue-light-400",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      brand: "bg-brand-500 text-white dark:text-white",
      success: "bg-success-500 text-white dark:text-white",
      error: "bg-error-500 text-white dark:text-white",
      warning: "bg-warning-500 text-white dark:text-white",
      info: "bg-blue-light-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles} ${extraClass}`} title={`${title}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
