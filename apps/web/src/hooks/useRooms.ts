import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { roomsApi } from '../services/api';
import { cacheService } from '../services/cacheService';
import { useOrderStore } from '../stores/orderStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import type { LocalRoom } from '../services/db';

interface RoomWithOrder {
  _id: string;
  name: string;
  isActive: boolean;
  currentOrderId: string | null;
  currentOrder?: {
    _id: string;
    totalPrice: number;
    waiterId: string;
    waiterName: string;
  } | null;
}

interface UseRoomsReturn {
  rooms: RoomWithOrder[];
  loading: boolean;
  refreshing: boolean;
  isOnline: boolean;
  refresh: () => Promise<void>;
}

export function useRooms(): UseRoomsReturn {
  const [rooms, setRooms] = useState<RoomWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoadDone = useRef(false);

  const { isOnline } = useUIStore();
  const { user } = useAuthStore();
  const roomOrders = useOrderStore((state) => state.roomOrders);

  // Cache'dan yuklash
  const loadFromCache = useCallback(async (): Promise<RoomWithOrder[]> => {
    const cachedRooms = await cacheService.getRooms();
    if (cachedRooms.length > 0) {
      return cachedRooms.map((r) => ({
        _id: r._id,
        name: r.name,
        isActive: r.isActive,
        currentOrderId: r.currentOrderId,
        currentOrder: r.currentOrder,
      }));
    }
    return [];
  }, []);

  const loadRooms = useCallback(async (forceRefresh = false) => {
    try {
      // Avval cache'dan olish (tez yuklash uchun)
      if (!initialLoadDone.current || !forceRefresh) {
        const cachedRooms = await loadFromCache();
        if (cachedRooms.length > 0) {
          setRooms(cachedRooms);
          setLoading(false);
          initialLoadDone.current = true;

          // Agar offline bo'lsa yoki forceRefresh bo'lmasa, cache'dan foydalanish
          if (!isOnline) {
            return;
          }
        }
      }

      // Online bo'lsa server'dan yangilash
      if (isOnline) {
        try {
          const { data } = await roomsApi.getAll({ isActive: true });
          const serverRooms: RoomWithOrder[] = data.rooms;

          // Cache'ga saqlash
          await cacheService.cacheRooms(serverRooms);
          setRooms(serverRooms);
        } catch (apiError) {
          console.error('API error, using cache:', apiError);
          // API xatolik bo'lsa, cache'dan foydalanamiz
          const cachedRooms = await loadFromCache();
          if (cachedRooms.length > 0) {
            setRooms(cachedRooms);
          }
        }
      } else {
        // Offline - cache'dan olish
        const cachedRooms = await loadFromCache();
        if (cachedRooms.length > 0) {
          setRooms(cachedRooms);
        } else {
          console.warn('No cached rooms available');
          setRooms([]);
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error);

      // Xatolik bo'lsa cache'dan olishga harakat qilish
      const cachedRooms = await loadFromCache();
      if (cachedRooms.length > 0) {
        setRooms(cachedRooms);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline, loadFromCache]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadRooms(true);
  }, [loadRooms]);

  // Local o'zgarishlarni server/cache data bilan birlashtirish
  const roomsWithLocalChanges = useMemo(() => {
    return rooms.map((room) => {
      const localRoomOrder = roomOrders[room._id];

      // Agar shu xonada local o'zgarishlar bo'lsa
      if (localRoomOrder?.isDirty && localRoomOrder.order.items.length > 0) {
        return {
          ...room,
          currentOrder: {
            _id: localRoomOrder.order._id,
            totalPrice: localRoomOrder.order.totalPrice,
            waiterId: localRoomOrder.order.waiterId,
            waiterName: user?.name || '',
          },
        };
      }

      return room;
    });
  }, [rooms, roomOrders, user?.name]);

  return {
    rooms: roomsWithLocalChanges,
    loading,
    refreshing,
    isOnline,
    refresh,
  };
}
