import { useState, useEffect } from 'react';
import { waitersApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateShort } from '@repo/utils';

interface Stats {
  orders: number;
  revenue: number;
  commission: number;
}

export default function MyStatsPage() {
  const { user } = useAuthStore();
  const [todayStats, setTodayStats] = useState<Stats | null>(null);
  const [weekStats, setWeekStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [todayRes, weekRes] = await Promise.all([
        waitersApi.getStats(user._id, { from: today.toISOString() }),
        waitersApi.getStats(user._id, { from: weekAgo.toISOString() }),
      ]);

      setTodayStats(todayRes.data);
      setWeekStats(weekRes.data);
    } catch (error) {
      console.error('Error loading stats:', error);
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
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mening statistikam</h1>

      {/* Today's stats */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Bugun</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{todayStats?.orders || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Buyurtmalar</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(todayStats?.revenue || 0, false)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Daromad</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(todayStats?.commission || 0, false)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Komissiya</p>
          </div>
        </div>
      </div>

      {/* Week stats */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">Oxirgi 7 kun</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{weekStats?.orders || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Buyurtmalar</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(weekStats?.revenue || 0, false)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Daromad</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(weekStats?.commission || 0, false)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Komissiya</p>
          </div>
        </div>
      </div>
    </div>
  );
}
