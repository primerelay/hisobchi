import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Order, MenuItem, OrderItem } from '@repo/types';
import { ordersApi } from '../services/api';
import { db, LocalOrder } from '../services/db';
import { syncService } from '../services/syncService';
import { useUIStore } from './uiStore';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface RoomOrderState {
  order: Order;
  serverOrder: Order | null;
  isDirty: boolean;
}

interface OrderState {
  // Har bir xona uchun alohida order
  roomOrders: Record<string, RoomOrderState>;
  _hasHydrated: boolean;

  // Getters
  getOrder: (roomId: string) => Order | null;
  getIsDirty: (roomId: string) => boolean;
  hasLocalChanges: (roomId: string) => boolean;

  // Setters
  setServerOrder: (roomId: string, order: Order) => void;
  setHasHydrated: (state: boolean) => void;

  // Actions
  addItem: (roomId: string, menuItem: MenuItem) => void;
  removeItem: (roomId: string, menuItemId: string) => void;
  updateItemQuantity: (roomId: string, menuItemId: string, quantity: number) => void;
  clearOrder: (roomId: string) => void;
  syncCommission: (roomId: string) => void; // Ofitsiant komissiyasini yangilash

  // Sync
  syncWithServer: (roomId: string) => Promise<void>;
  closeOrder: (roomId: string) => Promise<boolean>;
  removeRoomOrder: (roomId: string) => void;
}

function calculateTotals(items: OrderItem[], commissionPercent: number) {
  const totalPrice = items.reduce((sum, i) => sum + i.subtotal, 0);
  const commissionAmount = Math.floor(totalPrice * (commissionPercent / 100));
  return { totalPrice, commissionAmount };
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      roomOrders: {},
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      getOrder: (roomId) => {
        return get().roomOrders[roomId]?.order || null;
      },

      getIsDirty: (roomId) => {
        return get().roomOrders[roomId]?.isDirty || false;
      },

      hasLocalChanges: (roomId) => {
        const roomOrder = get().roomOrders[roomId];
        return roomOrder?.isDirty && roomOrder.order.items.length > 0;
      },

      setServerOrder: (roomId, order) => {
        const { roomOrders } = get();
        const existing = roomOrders[roomId];

        // Ofitsiantning hozirgi komissiyasini olish
        const { user, restaurant } = useAuthStore.getState();
        const currentCommissionPercent = user?.commissionPercent ?? restaurant?.settings?.defaultCommission ?? 0;

        // Komissiyani qayta hisoblash (ofitsiantning hozirgi komissiyasi bilan)
        const { totalPrice, commissionAmount } = calculateTotals(order.items, currentCommissionPercent);

        const updatedOrder: Order = {
          ...order,
          totalPrice,
          waiterCommission: {
            percent: currentCommissionPercent,
            amount: commissionAmount,
          },
        };

        // Agar local o'zgarishlar bo'lsa, ularni saqlab qolamiz
        if (existing?.isDirty && existing.order.items.length > 0) {
          // Local order uchun ham komissiyani yangilash
          const { totalPrice: localTotal, commissionAmount: localCommission } = calculateTotals(
            existing.order.items,
            currentCommissionPercent
          );

          set({
            roomOrders: {
              ...roomOrders,
              [roomId]: {
                ...existing,
                order: {
                  ...existing.order,
                  totalPrice: localTotal,
                  waiterCommission: {
                    percent: currentCommissionPercent,
                    amount: localCommission,
                  },
                },
                serverOrder: updatedOrder,
              },
            },
          });
          return;
        }

        // Yangi order yoki o'zgarishlar yo'q
        set({
          roomOrders: {
            ...roomOrders,
            [roomId]: {
              order: updatedOrder,
              serverOrder: updatedOrder,
              isDirty: false,
            },
          },
        });
      },

      addItem: (roomId, menuItem) => {
        const { roomOrders } = get();
        const roomOrder = roomOrders[roomId];
        if (!roomOrder) return;

        const items = [...roomOrder.order.items];
        const existingIndex = items.findIndex((i) => i.menuItemId === menuItem._id);

        if (existingIndex >= 0) {
          items[existingIndex] = {
            ...items[existingIndex],
            quantity: items[existingIndex].quantity + 1,
            subtotal: items[existingIndex].price * (items[existingIndex].quantity + 1),
          };
        } else {
          items.push({
            menuItemId: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            subtotal: menuItem.price,
          });
        }

        const { totalPrice, commissionAmount } = calculateTotals(
          items,
          roomOrder.order.waiterCommission.percent
        );

        set({
          roomOrders: {
            ...roomOrders,
            [roomId]: {
              ...roomOrder,
              order: {
                ...roomOrder.order,
                items,
                totalPrice,
                waiterCommission: {
                  ...roomOrder.order.waiterCommission,
                  amount: commissionAmount,
                },
              },
              isDirty: true,
            },
          },
        });
      },

      removeItem: (roomId, menuItemId) => {
        const { roomOrders } = get();
        const roomOrder = roomOrders[roomId];
        if (!roomOrder) return;

        let items = [...roomOrder.order.items];
        const existingIndex = items.findIndex((i) => i.menuItemId === menuItemId);

        if (existingIndex >= 0) {
          if (items[existingIndex].quantity > 1) {
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: items[existingIndex].quantity - 1,
              subtotal: items[existingIndex].price * (items[existingIndex].quantity - 1),
            };
          } else {
            items = items.filter((_, i) => i !== existingIndex);
          }
        }

        const { totalPrice, commissionAmount } = calculateTotals(
          items,
          roomOrder.order.waiterCommission.percent
        );

        set({
          roomOrders: {
            ...roomOrders,
            [roomId]: {
              ...roomOrder,
              order: {
                ...roomOrder.order,
                items,
                totalPrice,
                waiterCommission: {
                  ...roomOrder.order.waiterCommission,
                  amount: commissionAmount,
                },
              },
              isDirty: true,
            },
          },
        });
      },

      updateItemQuantity: (roomId, menuItemId, quantity) => {
        const { roomOrders } = get();
        const roomOrder = roomOrders[roomId];
        if (!roomOrder) return;

        let items = [...roomOrder.order.items];

        if (quantity <= 0) {
          items = items.filter((i) => i.menuItemId !== menuItemId);
        } else {
          const existingIndex = items.findIndex((i) => i.menuItemId === menuItemId);
          if (existingIndex >= 0) {
            items[existingIndex] = {
              ...items[existingIndex],
              quantity,
              subtotal: items[existingIndex].price * quantity,
            };
          }
        }

        const { totalPrice, commissionAmount } = calculateTotals(
          items,
          roomOrder.order.waiterCommission.percent
        );

        set({
          roomOrders: {
            ...roomOrders,
            [roomId]: {
              ...roomOrder,
              order: {
                ...roomOrder.order,
                items,
                totalPrice,
                waiterCommission: {
                  ...roomOrder.order.waiterCommission,
                  amount: commissionAmount,
                },
              },
              isDirty: true,
            },
          },
        });
      },

      clearOrder: (roomId) => {
        const { roomOrders } = get();
        const roomOrder = roomOrders[roomId];
        if (!roomOrder) return;

        set({
          roomOrders: {
            ...roomOrders,
            [roomId]: {
              ...roomOrder,
              order: {
                ...roomOrder.order,
                items: [],
                totalPrice: 0,
                waiterCommission: {
                  ...roomOrder.order.waiterCommission,
                  amount: 0,
                },
              },
              isDirty: true,
            },
          },
        });
      },

      // Ofitsiantning hozirgi komissiyasini buyurtmaga sync qilish
      syncCommission: (roomId) => {
        const { roomOrders } = get();
        const roomOrder = roomOrders[roomId];
        if (!roomOrder) return;

        const { user, restaurant } = useAuthStore.getState();
        const currentCommissionPercent = user?.commissionPercent ?? restaurant?.settings?.defaultCommission ?? 0;

        // Agar komissiya o'zgarmagan bo'lsa, hech narsa qilmaymiz
        if (roomOrder.order.waiterCommission.percent === currentCommissionPercent) return;

        // Komissiyani yangilash va qayta hisoblash
        const { totalPrice, commissionAmount } = calculateTotals(
          roomOrder.order.items,
          currentCommissionPercent
        );

        set({
          roomOrders: {
            ...roomOrders,
            [roomId]: {
              ...roomOrder,
              order: {
                ...roomOrder.order,
                totalPrice,
                waiterCommission: {
                  percent: currentCommissionPercent,
                  amount: commissionAmount,
                },
              },
            },
          },
        });
      },

      syncWithServer: async (roomId) => {
        const { roomOrders } = get();
        const roomOrder = roomOrders[roomId];
        if (!roomOrder || !roomOrder.isDirty) return;

        const { isOnline } = useUIStore.getState();

        if (!isOnline) {
          await saveOrderLocally(roomOrder.order);
          toast.success('Buyurtma offline saqlandi');
          return;
        }

        try {
          const items = roomOrder.order.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          }));

          const res = await ordersApi.update(roomOrder.order._id, { items });
          set({
            roomOrders: {
              ...roomOrders,
              [roomId]: {
                order: res.data.order,
                serverOrder: res.data.order,
                isDirty: false,
              },
            },
          });
        } catch (error) {
          console.error('Error syncing with server:', error);
          throw error;
        }
      },

      closeOrder: async (roomId) => {
        const { roomOrders } = get();
        const roomOrder = roomOrders[roomId];
        if (!roomOrder) return false;

        const order = roomOrder.order;

        if (order.items.length === 0) {
          toast.error("Bo'sh buyurtmani yopib bo'lmaydi");
          return false;
        }

        const { isOnline } = useUIStore.getState();

        if (!isOnline) {
          const items = order.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          }));

          await syncService.addToSyncQueue({
            type: 'CLOSE_ORDER',
            payload: {
              orderId: order._id,
              items,
            },
            clientId: order.clientId || crypto.randomUUID(),
          });

          await db.orders.put({
            _id: order._id,
            clientId: order.clientId || crypto.randomUUID(),
            roomId: order.roomId,
            waiterId: order.waiterId,
            items: order.items,
            totalPrice: order.totalPrice,
            waiterCommission: order.waiterCommission,
            status: 'closed',
            openedAt: order.openedAt.toString(),
            closedAt: new Date().toISOString(),
            syncStatus: 'pending',
            updatedAt: new Date().toISOString(),
          });

          toast.success('Buyurtma offline yopildi. Internet kelganda sinxronlanadi.');

          // Remove from store
          const newRoomOrders = { ...roomOrders };
          delete newRoomOrders[roomId];
          set({ roomOrders: newRoomOrders });

          return true;
        }

        try {
          if (roomOrder.isDirty) {
            const items = order.items.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
            }));
            await ordersApi.update(order._id, { items });
          }

          await ordersApi.close(order._id);
          toast.success('Buyurtma yopildi');

          // Remove from store
          const newRoomOrders = { ...roomOrders };
          delete newRoomOrders[roomId];
          set({ roomOrders: newRoomOrders });

          return true;
        } catch (error) {
          console.error('Error closing order:', error);
          return false;
        }
      },

      removeRoomOrder: (roomId) => {
        const { roomOrders } = get();
        const newRoomOrders = { ...roomOrders };
        delete newRoomOrders[roomId];
        set({ roomOrders: newRoomOrders });
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        roomOrders: state.roomOrders,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Hydration check hook
export const useHasHydrated = () => {
  return useOrderStore((state) => state._hasHydrated);
};

// Room-specific hooks
export const useRoomOrder = (roomId: string) => {
  return useOrderStore((state) => state.roomOrders[roomId]?.order || null);
};

export const useRoomIsDirty = (roomId: string) => {
  return useOrderStore((state) => state.roomOrders[roomId]?.isDirty || false);
};

async function saveOrderLocally(order: Order): Promise<void> {
  const localOrder: LocalOrder = {
    _id: order._id,
    clientId: order.clientId || crypto.randomUUID(),
    roomId: order.roomId,
    waiterId: order.waiterId,
    items: order.items,
    totalPrice: order.totalPrice,
    waiterCommission: order.waiterCommission,
    status: order.status,
    openedAt: order.openedAt.toString(),
    closedAt: order.closedAt?.toString() || null,
    syncStatus: 'pending',
    updatedAt: new Date().toISOString(),
  };

  await db.orders.put(localOrder);
}
