import { memo } from 'react';
import { formatCurrency } from '@repo/utils';
import type { OrderItem } from '@repo/types';

interface SelectedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  totalPrice: number;
  commission?: {
    percent: number;
    amount: number;
  };
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onClearOrder: () => void;
  onCloseOrder: () => void;
}

const SelectedItemsModal = memo(function SelectedItemsModal({
  isOpen,
  onClose,
  items,
  totalPrice,
  commission,
  onUpdateQuantity,
  onClearOrder,
  onCloseOrder,
}: SelectedItemsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-white">
        <button onClick={onClose} className="p-1.5 -ml-1 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-gray-900">Tanlangan mahsulotlar</h2>
        <div className="w-8" />
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-medium">Savat bo'sh</p>
            <p className="text-sm mt-0.5">Mahsulotlarni tanlang</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.price)} × {item.quantity} = <span className="font-medium text-gray-700">{formatCurrency(item.subtotal)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold transition-transform active:scale-90"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold text-sm tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold transition-transform active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-white safe-bottom">
        {/* Summary */}
        <div className="mb-3 space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Mahsulotlar:</span>
            <span className="font-medium">{items.reduce((sum, i) => sum + i.quantity, 0)} ta</span>
          </div>

          {commission && commission.percent > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Ulush ({commission.percent}%):</span>
              <span className="font-medium text-green-600">{formatCurrency(commission.amount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="font-medium text-gray-900">Jami:</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClearOrder}
            disabled={items.length === 0}
            className="flex-1 btn btn-secondary py-2.5 text-sm"
          >
            Tozalash
          </button>
          <button
            onClick={onCloseOrder}
            disabled={items.length === 0}
            className="flex-1 btn-primary py-2.5 text-sm"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
});

export default SelectedItemsModal;
