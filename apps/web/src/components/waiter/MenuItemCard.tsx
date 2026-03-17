import { memo } from 'react';
import { formatCurrency } from '@repo/utils';
import clsx from 'clsx';
import type { MenuItem } from '@repo/types';
import type { LocalMenuItem } from '../../services/db';

interface MenuItemCardProps {
  item: MenuItem | LocalMenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

const MenuItemCard = memo(function MenuItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
  disabled = false,
}: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {quantity > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Name */}
        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>

        {/* Price */}
        <div className="text-sm font-bold text-primary-600 mt-1">
          {formatCurrency(item.price)}
        </div>

        {/* Quantity controls - separate row */}
        <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-gray-100">
          <button
            onClick={onRemove}
            disabled={quantity === 0 || disabled}
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-base font-bold',
              'transition-all active:scale-90',
              quantity > 0 && !disabled
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-300'
            )}
          >
            −
          </button>
          <span className="w-6 text-center font-bold text-gray-900 text-sm tabular-nums">
            {quantity}
          </span>
          <button
            onClick={onAdd}
            disabled={disabled}
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-base font-bold',
              'transition-all active:scale-90',
              !disabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-300'
            )}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
});

export default MenuItemCard;
