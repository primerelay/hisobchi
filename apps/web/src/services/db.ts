import Dexie, { Table } from 'dexie';
import type { OrderItem } from '@repo/types';

export interface LocalMenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export interface LocalRoom {
  _id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  currentOrderId: string | null;
  // Server'dan kelgan order ma'lumotlari
  currentOrder?: {
    _id: string;
    totalPrice: number;
    waiterId: string;
    waiterName: string;
  } | null;
}

export interface LocalOrder {
  _id?: string;
  clientId: string;
  roomId: string;
  waiterId: string;
  items: OrderItem[];
  totalPrice: number;
  waiterCommission: {
    percent: number;
    amount: number;
  };
  status: 'open' | 'closed' | 'cancelled';
  openedAt: string;
  closedAt: string | null;
  syncStatus: 'synced' | 'pending' | 'conflict';
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CLOSE_ORDER';
  payload: object;
  clientId: string;
  createdAt: number;
  attempts: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface CacheMetadata {
  key: string;
  value: string | number;
}

class OshxonaDB extends Dexie {
  menuItems!: Table<LocalMenuItem>;
  rooms!: Table<LocalRoom>;
  orders!: Table<LocalOrder>;
  syncQueue!: Table<SyncQueueItem>;
  metadata!: Table<CacheMetadata>;

  constructor() {
    super('hisobchi-pos');

    this.version(2).stores({
      menuItems: '_id, category, isActive, sortOrder',
      rooms: '_id, isActive, sortOrder',
      orders: '_id, clientId, roomId, waiterId, status, syncStatus, updatedAt',
      syncQueue: 'id, status, createdAt',
      metadata: 'key',
    });
  }
}

export const db = new OshxonaDB();

// Cache helper functions
export async function getLastSyncTime(): Promise<number> {
  const meta = await db.metadata.get('lastSyncAt');
  return (meta?.value as number) || 0;
}

export async function setLastSyncTime(timestamp: number): Promise<void> {
  await db.metadata.put({ key: 'lastSyncAt', value: timestamp });
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.menuItems, db.rooms, db.orders, db.syncQueue, db.metadata], async () => {
    await db.menuItems.clear();
    await db.rooms.clear();
    await db.orders.clear();
    await db.syncQueue.clear();
    await db.metadata.clear();
  });
}

// Cache timestamp helpers
export async function getCacheTimestamp(key: string): Promise<number> {
  const meta = await db.metadata.get(key);
  return (meta?.value as number) || 0;
}

export async function setCacheTimestamp(key: string): Promise<void> {
  await db.metadata.put({ key, value: Date.now() });
}
