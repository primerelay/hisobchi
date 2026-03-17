import { db, SyncQueueItem, LocalOrder } from './db';
import { syncApi, ordersApi } from './api';
import { useUIStore } from '../stores/uiStore';
import { cacheService } from './cacheService';
import toast from 'react-hot-toast';

export interface SyncOperation {
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CLOSE_ORDER';
  payload: object;
  clientId: string;
}

export const syncService = {
  async addToSyncQueue(operation: SyncOperation): Promise<string> {
    const id = crypto.randomUUID();
    const item: SyncQueueItem = {
      id,
      type: operation.type,
      payload: operation.payload,
      clientId: operation.clientId,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending',
    };

    await db.syncQueue.add(item);
    return id;
  },

  async processSyncQueue(): Promise<void> {
    const { setSyncing } = useUIStore.getState();

    if (!navigator.onLine) {
      return;
    }

    const pendingItems = await db.syncQueue
      .where('status')
      .equals('pending')
      .sortBy('createdAt');

    if (pendingItems.length === 0) {
      return;
    }

    setSyncing(true);

    let successCount = 0;
    let failCount = 0;

    for (const item of pendingItems) {
      try {
        await db.syncQueue.update(item.id, { status: 'syncing' });

        await this.processItem(item);

        await db.syncQueue.delete(item.id);

        // Update local order status
        if (item.type === 'CLOSE_ORDER') {
          const payload = item.payload as { orderId?: string; _id?: string };
          const orderId = payload.orderId || payload._id;
          if (orderId) {
            await db.orders.update(orderId, { syncStatus: 'synced' });
          }
        }

        successCount++;
      } catch (error) {
        console.error('Sync error for item:', item.id, error);

        const newAttempts = item.attempts + 1;
        if (newAttempts >= 3) {
          await db.syncQueue.update(item.id, {
            status: 'failed',
            attempts: newAttempts,
          });
          failCount++;
        } else {
          await db.syncQueue.update(item.id, {
            status: 'pending',
            attempts: newAttempts,
          });
        }
      }
    }

    setSyncing(false);

    // Notification
    if (successCount > 0 && failCount === 0) {
      toast.success(`${successCount} ta buyurtma sinxronlandi`);
    } else if (failCount > 0) {
      toast.error(`${failCount} ta buyurtma sinxronlanmadi`);
    }
  },

  async processItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'CREATE_ORDER': {
        const payload = item.payload as { roomId: string; items?: { menuItemId: string; quantity: number }[] };
        const response = await ordersApi.create({
          roomId: payload.roomId,
          items: payload.items,
          clientId: item.clientId,
        });

        // Update local order with server ID
        const localOrders = await db.orders.where('clientId').equals(item.clientId).toArray();
        if (localOrders.length > 0) {
          await db.orders.update(localOrders[0]._id!, {
            _id: response.data.order._id,
            syncStatus: 'synced',
          });
        }
        break;
      }

      case 'UPDATE_ORDER': {
        const payload = item.payload as { orderId: string; items: { menuItemId: string; quantity: number }[] };
        await ordersApi.update(payload.orderId, { items: payload.items });
        break;
      }

      case 'CLOSE_ORDER': {
        const payload = item.payload as {
          orderId: string;
          items: { menuItemId: string; quantity: number }[];
        };
        // First update items, then close
        if (payload.items && payload.items.length > 0) {
          await ordersApi.update(payload.orderId, { items: payload.items });
        }
        await ordersApi.close(payload.orderId);
        break;
      }

      default:
        console.warn('Unknown sync operation type:', item.type);
    }
  },

  async getPendingCount(): Promise<number> {
    return db.syncQueue.where('status').equals('pending').count();
  },

  async getFailedItems(): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('status').equals('failed').toArray();
  },

  async retryFailedItems(): Promise<void> {
    await db.syncQueue
      .where('status')
      .equals('failed')
      .modify({ status: 'pending', attempts: 0 });

    await this.processSyncQueue();
  },

  async clearFailedItems(): Promise<void> {
    await db.syncQueue.where('status').equals('failed').delete();
  },

  // Full sync - rooms va menu itemlarni yangilash
  async fullSync(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const { roomsApi, menuItemsApi } = await import('./api');

      const [roomsRes, menuRes] = await Promise.all([
        roomsApi.getAll({ isActive: true }),
        menuItemsApi.getAll({ isActive: true }),
      ]);

      await cacheService.cacheRooms(roomsRes.data.rooms);
      await cacheService.cacheMenuItems(menuRes.data.items);

      console.log('Full sync completed');
    } catch (error) {
      console.error('Full sync failed:', error);
    }
  },
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network online - starting sync');
    // First sync pending orders, then refresh cache
    syncService.processSyncQueue().then(() => {
      syncService.fullSync();
    });
  });

  // Periodic sync when online
  setInterval(() => {
    if (navigator.onLine) {
      syncService.processSyncQueue();
    }
  }, 30000); // Every 30 seconds

  // Initial sync on app load (if online)
  if (navigator.onLine) {
    // Delay initial sync to let app initialize
    setTimeout(() => {
      syncService.processSyncQueue().then(() => {
        // Only do full sync if we have pending items or cache is empty
        syncService.getPendingCount().then((count) => {
          if (count > 0) {
            syncService.fullSync();
          }
        });
      });
    }, 2000);
  }
}
