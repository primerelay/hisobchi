import { useState, useEffect } from 'react';
import { db } from '../services/db';

export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const count = await db.syncQueue.where('status').equals('pending').count();
      setPendingCount(count);
    };

    updateCount();

    // Subscribe to changes
    const interval = setInterval(updateCount, 2000);

    return () => clearInterval(interval);
  }, []);

  return { pendingCount };
}
