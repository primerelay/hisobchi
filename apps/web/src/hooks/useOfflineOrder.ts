import { useState, useEffect, useCallback } from 'react';
import { useOrderStore, useHasHydrated } from '../stores/orderStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { ordersApi, menuItemsApi, roomsApi } from '../services/api';
import { cacheService } from '../services/cacheService';
import { db, LocalMenuItem, LocalOrder } from '../services/db';
import { syncService } from '../services/syncService';
import type { MenuItem, Order } from '@repo/types';
import toast from 'react-hot-toast';

interface UseOfflineOrderReturn {
  order: Order | null;
  menuItems: (MenuItem | LocalMenuItem)[];
  room: { _id: string; name: string } | null;
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
  const [room, setRoom] = useState<{ _id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const { isOnline } = useUIStore();
  const { user, restaurant } = useAuthStore();
  const hasHydrated = useHasHydrated();

  const {
    getOrder,
    hasLocalChanges,
    setServerOrder,
    addItem: storeAddItem,
    removeItem: storeRemoveItem,
    updateItemQuantity: storeUpdateQuantity,
    clearOrder: storeClearOrder,
    closeOrder: storeCloseOrder,
    syncCommission,
  } = useOrderStore();

  // Get current room's order
  const order = useOrderStore((state) => (roomId ? state.roomOrders[roomId]?.order : null) || null);
  const isDirty = useOrderStore((state) => (roomId ? state.roomOrders[roomId]?.isDirty : false) || false);

  // Xonaga kirganda komissiyani sync qilish
  useEffect(() => {
    if (roomId && hasHydrated) {
      syncCommission(roomId);
    }
  }, [roomId, hasHydrated, syncCommission, user?.commissionPercent]);

  // Load data
  useEffect(() => {
    if (!roomId || !hasHydrated) return;

    const loadData = async () => {
      setLoading(true);

      const localChangesExist = hasLocalChanges(roomId);

      // Avval cache'dan yuklash (tez ko'rinishi uchun)
      const cachedMenuItems = await cacheService.getMenuItems();
      if (cachedMenuItems.length > 0) {
        setMenuItems(cachedMenuItems);
      }

      const cachedRoom = await cacheService.getRoomById(roomId);
      if (cachedRoom) {
        setRoom({ _id: roomId, name: cachedRoom.name });
      }

      try {
        if (isOnline) {
          // Online: Server'dan olish va cache'lash
          try {
            const [roomRes, menuRes] = await Promise.all([
              roomsApi.getById(roomId),
              menuItemsApi.getAll({ isActive: true }),
            ]);

            setRoom({ _id: roomId, name: roomRes.data.room.name });
            setMenuItems(menuRes.data.items);

            // Cache menu items
            await cacheService.cacheMenuItems(menuRes.data.items);

            // Local o'zgarishlar bo'lsa, server'dan order olmaymiz
            if (localChangesExist) {
              console.log('Local changes preserved for room:', roomId);
              setLoading(false);
              return;
            }

            // Server'dan order olish
            const orderRes = await ordersApi.getOrCreateForRoom(roomId);
            setServerOrder(roomId, orderRes.data.order);
          } catch (apiError) {
            console.error('API error, using cache:', apiError);
            // API xatolik bo'lsa cache'dan foydalanamiz
            await loadFromCache(localChangesExist);
          }
        } else {
          // Offline: Cache'dan olish
          await loadFromCache(localChangesExist);
        }
      } catch (error) {
        console.error('Error loading data:', error);

        // Xatolik bo'lsa cache'dan olishga harakat qilish
        await loadFromCache(localChangesExist);
      } finally {
        setLoading(false);
      }
    };

    const loadFromCache = async (localChangesExist: boolean) => {
      // Menu items
      const cachedMenuItems = await cacheService.getMenuItems();
      if (cachedMenuItems.length > 0) {
        setMenuItems(cachedMenuItems);
      } else {
        console.warn('No cached menu items');
      }

      // Room
      const cachedRoom = await cacheService.getRoomById(roomId!);
      if (cachedRoom) {
        setRoom({ _id: roomId!, name: cachedRoom.name });
      } else {
        setRoom({ _id: roomId!, name: 'Xona' });
      }

      // Order - agar local o'zgarishlar bo'lmasa
      if (!localChangesExist) {
        // IndexedDB'dan ochiq order qidirish
        const localOrder = await db.orders
          .where('roomId')
          .equals(roomId!)
          .filter((o) => o.status === 'open')
          .first();

        if (localOrder) {
          const orderData = convertLocalOrderToOrder(localOrder);
          setServerOrder(roomId!, orderData);
        } else {
          // Yangi offline order yaratish
          const newOrder = createNewOrder(roomId!);
          setServerOrder(roomId!, newOrder);

          // IndexedDB'ga saqlash
          await saveOrderToIndexedDB(newOrder);

          if (!isOnline) {
            toast('Offline rejimda buyurtma yaratildi', { icon: 'ℹ️' });
          }
        }
      }
    };

    loadData();
  }, [roomId, isOnline, hasHydrated, setServerOrder, hasLocalChanges]);

  // Helper: Create new order
  const createNewOrder = (roomId: string): Order => {
    const now = new Date();
    const clientId = crypto.randomUUID();

    // Ofitsiantning shaxsiy komissiyasini ishlatish
    // Agar ofitsiantda bo'lmasa, restoranning default komissiyasini ishlatish
    const commissionPercent = user?.commissionPercent ?? restaurant?.settings?.defaultCommission ?? 0;

    return {
      _id: clientId,
      restaurantId: restaurant?._id || '',
      roomId,
      waiterId: user?._id || '',
      items: [],
      totalPrice: 0,
      waiterCommission: {
        percent: commissionPercent,
        amount: 0,
      },
      status: 'open',
      clientId,
      openedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  };

  // Helper: Save order to IndexedDB
  const saveOrderToIndexedDB = async (order: Order): Promise<void> => {
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
      closedAt: null,
      syncStatus: 'pending',
      updatedAt: new Date().toISOString(),
    };

    await db.orders.put(localOrder);
  };

  // Helper: Convert LocalOrder to Order
  const convertLocalOrderToOrder = (localOrder: LocalOrder): Order => {
    return {
      _id: localOrder._id || crypto.randomUUID(),
      restaurantId: restaurant?._id || '',
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
  };

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
