import { db, LocalMenuItem } from './db';
import type { MenuItem } from '@repo/types';

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const cacheService = {
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
      await db.metadata.put({ key: 'menuCachedAt', value: Date.now() });
    });
  },

  async getMenuItems(): Promise<LocalMenuItem[]> {
    // IndexedDB stores booleans as-is, filter in memory for safety
    const all = await db.menuItems.orderBy('sortOrder').toArray();
    return all.filter((item) => item.isActive);
  },

  async getCacheTimestamp(): Promise<number> {
    const meta = await db.metadata.get('menuCachedAt');
    return (meta?.value as number) || 0;
  },

  async isCacheValid(): Promise<boolean> {
    const cachedAt = await this.getCacheTimestamp();
    if (!cachedAt) return false;
    return Date.now() - cachedAt < CACHE_EXPIRY_MS;
  },

  async clearCache(): Promise<void> {
    await db.transaction('rw', [db.menuItems, db.metadata], async () => {
      await db.menuItems.clear();
      await db.metadata.delete('menuCachedAt');
    });
  },

  async getMenuItemById(id: string): Promise<LocalMenuItem | undefined> {
    return db.menuItems.get(id);
  },

  async getMenuItemsByCategory(category: string): Promise<LocalMenuItem[]> {
    const items = await db.menuItems.where('category').equals(category).sortBy('sortOrder');
    return items.filter((item) => item.isActive);
  },
};
