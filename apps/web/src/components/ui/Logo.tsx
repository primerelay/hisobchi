import clsx from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
  showIcon?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', variant = 'color', showIcon = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textColors = {
    light: 'text-white',
    dark: 'text-gray-900',
    color: 'text-primary-600',
  };

  const gradientColors = {
    light: 'from-white to-blue-100',
    dark: 'from-gray-800 to-gray-900',
    color: 'from-primary-500 to-primary-700',
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {showIcon && (
        <div
          className={clsx(
            'relative flex items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
            iconSizes[size],
            gradientColors[variant]
          )}
        >
          {/* Calculator/Abacus icon */}
          <svg
            className={clsx(
              'relative z-10',
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : size === 'lg' ? 'w-6 h-6' : 'w-7 h-7',
              variant === 'color' ? 'text-white' : variant === 'light' ? 'text-primary-600' : 'text-white'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm" />
        </div>
      )}
      <div className="flex flex-col">
        <span
          className={clsx(
            'font-black tracking-tight leading-none',
            sizeClasses[size],
            textColors[variant]
          )}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Hisobchi
        </span>
        {size === 'xl' && (
          <span
            className={clsx(
              'text-xs font-medium tracking-wide opacity-70 mt-0.5',
              variant === 'light' ? 'text-white/80' : variant === 'dark' ? 'text-gray-500' : 'text-primary-400'
            )}
          >
            POS TIZIMI
          </span>
        )}
      </div>
    </div>
  );
}
