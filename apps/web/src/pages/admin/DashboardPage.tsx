import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api';
import { formatCurrency } from '@repo/utils';
import type { DashboardStats } from '@repo/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await analyticsApi.getDashboard();
      setStats(data.stats);
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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Boshqaruv paneli</h1>

      {/* Today's stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Bugungi daromad</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats?.today.revenue || 0)}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Kecha: {formatCurrency(stats?.yesterday.revenue || 0)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Bugungi buyurtmalar</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.today.orderCount || 0}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Kecha: {stats?.yesterday.orderCount || 0}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">O'rtacha buyurtma</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats?.today.avgOrderValue || 0)}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Kecha: {formatCurrency(stats?.yesterday.avgOrderValue || 0)}
          </p>
        </div>
      </div>

      {/* Period stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 mb-4">Bu hafta</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Daromad:</span>
              <span className="font-medium">{formatCurrency(stats?.thisWeek.revenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Buyurtmalar:</span>
              <span className="font-medium">{stats?.thisWeek.orderCount || 0}</span>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 mb-4">Bu oy</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Daromad:</span>
              <span className="font-medium">{formatCurrency(stats?.thisMonth.revenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Buyurtmalar:</span>
              <span className="font-medium">{stats?.thisMonth.orderCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
