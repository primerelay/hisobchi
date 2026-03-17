import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api';
import { formatCurrency } from '@repo/utils';
import type { TopItem, WaiterStats } from '@repo/types';

export default function AnalyticsPage() {
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [waiterStats, setWaiterStats] = useState<WaiterStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    try {
      const [topItemsRes, waitersRes] = await Promise.all([
        analyticsApi.getTopItems({
          from: monthAgo.toISOString(),
          to: now.toISOString(),
          limit: 10,
        }),
        analyticsApi.getWaiters({
          from: monthAgo.toISOString(),
          to: now.toISOString(),
        }),
      ]);

      setTopItems(topItemsRes.data.items);
      setWaiterStats(waitersRes.data.waiters);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analitika</h1>
      <p className="text-gray-500 mb-6">Oxirgi 30 kun</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Eng ko'p sotilgan taomlar</h2>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div key={item.menuItemId} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} ta sotilgan</p>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
            {topItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">Ma'lumot yo'q</p>
            )}
          </div>
        </div>

        {/* Waiter Performance */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ofitsiantlar samaradorligi</h2>
          <div className="space-y-3">
            {waiterStats.map((waiter, index) => (
              <div key={waiter.waiterId} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{waiter.name}</p>
                  <p className="text-sm text-gray-500">{waiter.orderCount} ta buyurtma</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(waiter.revenue)}</p>
                  <p className="text-sm text-green-600">{formatCurrency(waiter.commission)} kom.</p>
                </div>
              </div>
            ))}
            {waiterStats.length === 0 && (
              <p className="text-gray-500 text-center py-4">Ma'lumot yo'q</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
