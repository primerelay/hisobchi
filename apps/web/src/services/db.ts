import Dexie, { Table } from 'dexie';
import type { MenuItem, Room, Order, OrderItem } from '@repo/types';

export interface LocalMenuItem extends Omit<MenuItem, '_id' | 'restaurantId' | 'createdAt' | 'updatedAt'> {
  _id: string;
}

export interface LocalRoom extends Omit<Room, '_id' | 'restaurantId' | 'createdAt' | 'updatedAt'> {
  _id: string;
  currentOrderId: string | null;
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

export interface SyncMetadata {
  key: string;
  value: string | number;
}

class OshxonaDB extends Dexie {
  menuItems!: Table<LocalMenuItem>;
  rooms!: Table<LocalRoom>;
  orders!: Table<LocalOrder>;
  syncQueue!: Table<SyncQueueItem>;
  metadata!: Table<SyncMetadata>;

  constructor() {
    super('oshxona-pos');

    this.version(1).stores({
      menuItems: '_id, category, isActive, sortOrder',
      rooms: '_id, isActive, sortOrder',
      orders: '_id, clientId, roomId, waiterId, status, syncStatus, updatedAt',
      syncQueue: 'id, status, createdAt',
      metadata: 'key',
    });
  }
}

export const db = new OshxonaDB();

// Helper functions
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
