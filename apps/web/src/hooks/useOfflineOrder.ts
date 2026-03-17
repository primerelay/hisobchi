import { useState, useEffect, useCallback } from 'react';
import { useOrderStore, useHasHydrated } from '../stores/orderStore';
import { useUIStore } from '../stores/uiStore';
import { ordersApi, menuItemsApi, roomsApi } from '../services/api';
import { cacheService } from '../services/cacheService';
import { db, LocalMenuItem, LocalOrder } from '../services/db';
import { syncService } from '../services/syncService';
import type { MenuItem, Order } from '@repo/types';
import toast from 'react-hot-toast';

interface UseOfflineOrderReturn {
  order: Order | null;
  menuItems: (MenuItem | LocalMenuItem)[];
  room: { name: string } | null;
  loading: boolean;
  isDirty: boolean;
  isOnline: boolean;
  addItem: (menuItem: MenuItem | LocalMenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateItemQuantity: (menuItemId: string, quantity: number) => void;
  clearOrder: () => void;
  closeOrder: () => Promise<boolean>;
  getQuantity: (menuItemId: string) => number;
}

export function useOfflineOrder(roomId: string | undefined): UseOfflineOrderReturn {
  const [menuItems, setMenuItems] = useState<(MenuItem | LocalMenuItem)[]>([]);
  const [room, setRoom] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const { isOnline } = useUIStore();
  const hasHydrated = useHasHydrated();

  // Room-specific store methods
  const {
    getOrder,
    getIsDirty,
    hasLocalChanges,
    setServerOrder,
    addItem: storeAddItem,
    removeItem: storeRemoveItem,
    updateItemQuantity: storeUpdateQuantity,
    clearOrder: storeClearOrder,
    closeOrder: storeCloseOrder,
  } = useOrderStore();

  // Get current room's order
  const order = useOrderStore((state) => (roomId ? state.roomOrders[roomId]?.order : null) || null);
  const isDirty = useOrderStore((state) => (roomId ? state.roomOrders[roomId]?.isDirty : false) || false);

  // Load data - hydration kutamiz
  useEffect(() => {
    if (!roomId || !hasHydrated) return;

    const loadData = async () => {
      setLoading(true);

      // Store'dan hozirgi holatni olish
      const localChangesExist = hasLocalChanges(roomId);

      try {
        if (isOnline) {
          // Menu va room ma'lumotlarini olish
          const [roomRes, menuRes] = await Promise.all([
            roomsApi.getById(roomId),
            menuItemsApi.getAll({ isActive: true }),
          ]);

          setRoom(roomRes.data.room);
          setMenuItems(menuRes.data.items);

          // Cache menu items
          await cacheService.cacheMenuItems(menuRes.data.items);

          // Agar local o'zgarishlar bo'lsa, server'dan order olmaymiz
          if (localChangesExist) {
            console.log('Local changes preserved for room:', roomId);
            setLoading(false);
            return;
          }

          // Server'dan order olish
          const orderRes = await ordersApi.getOrCreateForRoom(roomId);
          setServerOrder(roomId, orderRes.data.order);
        } else {
          // Offline mode
          const cachedMenuItems = await cacheService.getMenuItems();
          setMenuItems(cachedMenuItems);

          const localRoom = await db.rooms.get(roomId);
          setRoom(localRoom ? { name: localRoom.name } : { name: 'Xona' });

          // Agar local o'zgarishlar bo'lsa, ularni saqlab qolamiz
          if (localChangesExist) {
            setLoading(false);
            return;
          }

          // IndexedDB'dan order qidirish
          const localOrder = await db.orders
            .where('roomId')
            .equals(roomId)
            .and((o) => o.status === 'open')
            .first();

          if (localOrder) {
            const orderData: Order = {
              _id: localOrder._id || crypto.randomUUID(),
              restaurantId: '',
              roomId: localOrder.roomId,
              waiterId: localOrder.waiterId,
              items: localOrder.items,
              totalPrice: localOrder.totalPrice,
              waiterCommission: localOrder.waiterCommission,
              status: localOrder.status,
              clientId: localOrder.clientId,
              openedAt: new Date(localOrder.openedAt),
              createdAt: new Date(localOrder.openedAt),
              updatedAt: new Date(localOrder.updatedAt),
            };
            setServerOrder(roomId, orderData);
          } else {
            toast('Offline rejimda yangi buyurtma yaratildi', { icon: 'ℹ️' });
            const newOrder = await createLocalOrder(roomId);
            setServerOrder(roomId, newOrder);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);

        // Agar local o'zgarishlar bo'lsa, xatolik bo'lsa ham davom etamiz
        if (localChangesExist) {
          const cachedMenuItems = await cacheService.getMenuItems();
          if (cachedMenuItems.length > 0) {
            setMenuItems(cachedMenuItems);
          }
          setLoading(false);
          return;
        }

        const cachedMenuItems = await cacheService.getMenuItems();
        if (cachedMenuItems.length > 0) {
          setMenuItems(cachedMenuItems);
          toast.error("Serverga ulanib bo'lmadi, cache ishlatilmoqda");
        } else {
          toast.error("Ma'lumotlar yuklanmadi");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roomId, isOnline, hasHydrated, setServerOrder, hasLocalChanges]);

  const addItem = useCallback(
    (menuItem: MenuItem | LocalMenuItem) => {
      if (!roomId) return;
      storeAddItem(roomId, menuItem as MenuItem);
    },
    [roomId, storeAddItem]
  );

  const removeItem = useCallback(
    (menuItemId: string) => {
      if (!roomId) return;
      storeRemoveItem(roomId, menuItemId);
    },
    [roomId, storeRemoveItem]
  );

  const updateItemQuantity = useCallback(
    (menuItemId: string, quantity: number) => {
      if (!roomId) return;
      storeUpdateQuantity(roomId, menuItemId, quantity);
    },
    [roomId, storeUpdateQuantity]
  );

  const clearOrder = useCallback(() => {
    if (!roomId) return;
    if (!confirm('Buyurtmani tozalashni xohlaysizmi?')) return;
    storeClearOrder(roomId);
    toast.success('Buyurtma tozalandi');
  }, [roomId, storeClearOrder]);

  const closeOrder = useCallback(async () => {
    if (!roomId) return false;
    return storeCloseOrder(roomId);
  }, [roomId, storeCloseOrder]);

  const getQuantity = useCallback(
    (menuItemId: string) => {
      return order?.items.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
    },
    [order]
  );

  return {
    order,
    menuItems,
    room,
    loading: loading || !hasHydrated,
    isDirty,
    isOnline,
    addItem,
    removeItem,
    updateItemQuantity,
    clearOrder,
    closeOrder,
    getQuantity,
  };
}

async function createLocalOrder(roomId: string): Promise<Order> {
  const clientId = crypto.randomUUID();
  const now = new Date();

  const { useAuthStore } = await import('../stores/authStore');
  const user = useAuthStore.getState().user;
  const restaurant = useAuthStore.getState().restaurant;

  const localOrder: LocalOrder = {
    clientId,
    roomId,
    waiterId: user?._id || '',
    items: [],
    totalPrice: 0,
    waiterCommission: {
      percent: restaurant?.settings?.defaultCommission || 0,
      amount: 0,
    },
    status: 'open',
    openedAt: now.toISOString(),
    closedAt: null,
    syncStatus: 'pending',
    updatedAt: now.toISOString(),
  };

  await db.orders.add(localOrder);

  await syncService.addToSyncQueue({
    type: 'CREATE_ORDER',
    payload: { roomId },
    clientId,
  });

  return {
    _id: clientId,
    restaurantId: restaurant?._id || '',
    roomId,
    waiterId: user?._id || '',
    items: [],
    totalPrice: 0,
    waiterCommission: localOrder.waiterCommission,
    status: 'open',
    clientId,
    openedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}
