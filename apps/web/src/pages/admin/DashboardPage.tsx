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

  const getChangePercent = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const revenueChange = getChangePercent(stats?.today.revenue || 0, stats?.yesterday.revenue || 0);
  const ordersChange = getChangePercent(stats?.today.orderCount || 0, stats?.yesterday.orderCount || 0);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Boshqaruv paneli</h1>

      {/* Today's stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Revenue card */}
        <div className="card p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium mb-1">Bugungi daromad</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatCurrency(stats?.today.revenue || 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              revenueChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange}%
            </span>
            <span className="text-xs text-gray-500">
              Kecha: {formatCurrency(stats?.yesterday.revenue || 0)}
            </span>
          </div>
        </div>

        {/* Orders card */}
        <div className="card p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Bugungi buyurtmalar</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats?.today.orderCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              ordersChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {ordersChange >= 0 ? '+' : ''}{ordersChange}%
            </span>
            <span className="text-xs text-gray-500">
              Kecha: {stats?.yesterday.orderCount || 0}
            </span>
          </div>
        </div>

        {/* Average order card */}
        <div className="card p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium mb-1">O'rtacha buyurtma</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatCurrency(stats?.today.avgOrderValue || 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Kecha: {formatCurrency(stats?.yesterday.avgOrderValue || 0)}
          </div>
        </div>
      </div>

      {/* Period stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Bu hafta</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Daromad:</span>
              <span className="font-semibold text-lg">{formatCurrency(stats?.thisWeek.revenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Buyurtmalar:</span>
              <span className="font-semibold text-lg">{stats?.thisWeek.orderCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Bu oy</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Daromad:</span>
              <span className="font-semibold text-lg">{formatCurrency(stats?.thisMonth.revenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Buyurtmalar:</span>
              <span className="font-semibold text-lg">{stats?.thisMonth.orderCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
