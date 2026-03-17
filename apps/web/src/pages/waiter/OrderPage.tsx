import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useOfflineOrder } from '../../hooks/useOfflineOrder';
import MenuItemCard from '../../components/waiter/MenuItemCard';
import SelectedItemsModal from '../../components/waiter/SelectedItemsModal';
import { formatCurrency } from '@repo/utils';
import { CATEGORY_LABELS } from '@repo/constants';
import clsx from 'clsx';
import type { MenuItem } from '@repo/types';
import type { LocalMenuItem } from '../../services/db';

type Category = 'food' | 'drink' | 'service';

export default function OrderPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { restaurant } = useAuthStore();

  const [activeCategory, setActiveCategory] = useState<Category>('food');
  const [closing, setClosing] = useState(false);
  const [showSelectedModal, setShowSelectedModal] = useState(false);

  const {
    order,
    menuItems,
    room,
    loading,
    isDirty,
    isOnline,
    addItem,
    removeItem,
    updateItemQuantity,
    clearOrder,
    closeOrder,
    getQuantity,
  } = useOfflineOrder(roomId);

  const filteredItems = useMemo(
    () => menuItems.filter((item) => item.category === activeCategory),
    [menuItems, activeCategory]
  );

  const totalItemsCount = useMemo(
    () => order?.items.reduce((sum, i) => sum + i.quantity, 0) || 0,
    [order]
  );

  const handleAddItem = useCallback(
    (item: MenuItem | LocalMenuItem) => {
      addItem(item);
    },
    [addItem]
  );

  const handleRemoveItem = useCallback(
    (menuItemId: string) => {
      removeItem(menuItemId);
    },
    [removeItem]
  );

  const handleCloseOrder = async () => {
    if (!order || order.items.length === 0) return;

    if (
      !confirm(`Buyurtmani yopishni tasdiqlaysizmi?\n\nJami: ${formatCurrency(order.totalPrice)}`)
    ) {
      return;
    }

    setClosing(true);
    setShowSelectedModal(false);
    const success = await closeOrder();
    setClosing(false);

    if (success) {
      navigate('/waiter/rooms');
    }
  };

  const commissionEnabled = restaurant?.settings.commissionEnabled;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/waiter/rooms')} className="p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{room?.name}</span>
          {!isOnline && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              Offline
            </span>
          )}
          {isDirty && isOnline && (
            <span className="w-2 h-2 bg-orange-500 rounded-full" title="Saqlanmagan o'zgarishlar" />
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto">
        {(['food', 'drink', 'service'] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Menu items grid */}
      <div className="flex-1 overflow-auto p-3 pb-28">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              quantity={getQuantity(item._id)}
              onAdd={() => handleAddItem(item)}
              onRemove={() => handleRemoveItem(item._id)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Bu kategoriyada mahsulot yo'q
          </div>
        )}
      </div>

      {/* Floating cart button */}
      <div className="fixed bottom-4 left-3 right-3 safe-bottom">
        <button
          onClick={() => setShowSelectedModal(true)}
          disabled={closing}
          className={clsx(
            'w-full py-3 px-4 rounded-xl flex items-center justify-between',
            'bg-primary-600 text-white shadow-lg',
            'transition-all active:scale-[0.98]',
            closing && 'opacity-50'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-primary-600 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span className="font-medium text-sm">
              {totalItemsCount > 0 ? `${totalItemsCount} ta` : 'Savat'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {closing ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <>
                <span className="text-base font-bold">{formatCurrency(order?.totalPrice || 0)}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Selected items modal */}
      <SelectedItemsModal
        isOpen={showSelectedModal}
        onClose={() => setShowSelectedModal(false)}
        items={order?.items || []}
        totalPrice={order?.totalPrice || 0}
        commission={
          commissionEnabled && order?.waiterCommission.percent
            ? order.waiterCommission
            : undefined
        }
        onUpdateQuantity={updateItemQuantity}
        onClearOrder={clearOrder}
        onCloseOrder={handleCloseOrder}
      />
    </div>
  );
}
