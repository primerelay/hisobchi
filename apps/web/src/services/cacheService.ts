import { db, LocalMenuItem, LocalRoom, getCacheTimestamp, setCacheTimestamp } from './db';
import type { MenuItem } from '@repo/types';

const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes for rooms
const MENU_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours for menu

interface RoomWithOrder {
  _id: string;
  name: string;
  isActive: boolean;
  sortOrder?: number;
  currentOrderId: string | null;
  currentOrder?: {
    _id: string;
    totalPrice: number;
    waiterId: string;
    waiterName: string;
  } | null;
}

export const cacheService = {
  // ============ MENU ITEMS ============
  async cacheMenuItems(items: MenuItem[]): Promise<void> {
    const localItems: LocalMenuItem[] = items.map((item) => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    }));

    await db.transaction('rw', [db.menuItems, db.metadata], async () => {
      await db.menuItems.clear();
      await db.menuItems.bulkPut(localItems);
      await setCacheTimestamp('menuCachedAt');
    });
  },

  async getMenuItems(): Promise<LocalMenuItem[]> {
    const all = await db.menuItems.orderBy('sortOrder').toArray();
    return all.filter((item) => item.isActive);
  },

  async isMenuCacheValid(): Promise<boolean> {
    const cachedAt = await getCacheTimestamp('menuCachedAt');
    if (!cachedAt) return false;
    return Date.now() - cachedAt < MENU_CACHE_EXPIRY_MS;
  },

  async getMenuItemById(id: string): Promise<LocalMenuItem | undefined> {
    return db.menuItems.get(id);
  },

  async getMenuItemsByCategory(category: string): Promise<LocalMenuItem[]> {
    const items = await db.menuItems.where('category').equals(category).sortBy('sortOrder');
    return items.filter((item) => item.isActive);
  },

  // ============ ROOMS ============
  async cacheRooms(rooms: RoomWithOrder[]): Promise<void> {
    const localRooms: LocalRoom[] = rooms.map((room) => ({
      _id: room._id,
      name: room.name,
      sortOrder: room.sortOrder || 0,
      isActive: room.isActive,
      currentOrderId: room.currentOrderId,
      currentOrder: room.currentOrder || null,
    }));

    await db.transaction('rw', [db.rooms, db.metadata], async () => {
      await db.rooms.clear();
      await db.rooms.bulkPut(localRooms);
      await setCacheTimestamp('roomsCachedAt');
    });
  },

  async getRooms(): Promise<LocalRoom[]> {
    const all = await db.rooms.orderBy('sortOrder').toArray();
    return all.filter((room) => room.isActive);
  },

  async getRoomById(id: string): Promise<LocalRoom | undefined> {
    return db.rooms.get(id);
  },

  async isRoomsCacheValid(): Promise<boolean> {
    const cachedAt = await getCacheTimestamp('roomsCachedAt');
    if (!cachedAt) return false;
    return Date.now() - cachedAt < CACHE_EXPIRY_MS;
  },

  async updateRoomOrder(roomId: string, orderData: LocalRoom['currentOrder']): Promise<void> {
    const room = await db.rooms.get(roomId);
    if (room) {
      await db.rooms.update(roomId, {
        currentOrder: orderData,
        currentOrderId: orderData?._id || null,
      });
    }
  },

  // ============ GENERAL ============
  async clearCache(): Promise<void> {
    await db.transaction('rw', [db.menuItems, db.rooms, db.metadata], async () => {
      await db.menuItems.clear();
      await db.rooms.clear();
      await db.metadata.delete('menuCachedAt');
      await db.metadata.delete('roomsCachedAt');
    });
  },

  async hasAnyCachedData(): Promise<boolean> {
    const menuCount = await db.menuItems.count();
    const roomCount = await db.rooms.count();
    return menuCount > 0 || roomCount > 0;
  },
};
