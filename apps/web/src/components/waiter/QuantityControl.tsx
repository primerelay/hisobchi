import { memo } from 'react';
import clsx from 'clsx';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const QuantityControl = memo(function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  disabled = false,
  size = 'md',
}: QuantityControlProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-lg',
    lg: 'w-11 h-11 text-xl',
  };

  const spanSizeClasses = {
    sm: 'w-5 text-sm',
    md: 'w-7 text-base',
    lg: 'w-9 text-lg',
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onDecrease}
        disabled={quantity === 0 || disabled}
        className={clsx(
          'rounded-full flex items-center justify-center font-bold',
          'transition-all active:scale-90',
          sizeClasses[size],
          quantity > 0 && !disabled
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        )}
        aria-label="Kamaytirish"
      >
        −
      </button>
      <span className={clsx('text-center font-bold text-gray-900 tabular-nums', spanSizeClasses[size])}>
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={disabled}
        className={clsx(
          'rounded-full flex items-center justify-center font-bold',
          'transition-all active:scale-90',
          sizeClasses[size],
          !disabled
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        )}
        aria-label="Ko'paytirish"
      >
        +
      </button>
    </div>
  );
});

export default QuantityControl;
