import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/api';
import { formatCurrency } from '@repo/utils';

interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function SuperDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await superAdminApi.getStats();
      setStats(data);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform statistikasi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Jami restoranlar</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalRestaurants || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Faol restoranlar</p>
          <p className="text-3xl font-bold text-green-600">{stats?.activeRestaurants || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Jami buyurtmalar</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Jami daromad</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
