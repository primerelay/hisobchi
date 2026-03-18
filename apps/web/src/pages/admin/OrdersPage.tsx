import { useState, useEffect } from 'react';
import { ordersApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '@repo/utils';
import { ORDER_STATUS_LABELS } from '@repo/constants';
import clsx from 'clsx';
import type { Order } from '@repo/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const { data } = await ordersApi.getAll(params);
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Buyurtmalar</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-full font-medium transition-colors',
            !statusFilter
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Barchasi
        </button>
        <button
          onClick={() => { setStatusFilter('open'); setPage(1); }}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-full font-medium transition-colors',
            statusFilter === 'open'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          )}
        >
          Ochiq
        </button>
        <button
          onClick={() => { setStatusFilter('closed'); setPage(1); }}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-full font-medium transition-colors',
            statusFilter === 'closed'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          )}
        >
          Yopilgan
        </button>
        <button
          onClick={() => { setStatusFilter('cancelled'); setPage(1); }}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-full font-medium transition-colors',
            statusFilter === 'cancelled'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          )}
        >
          Bekor qilingan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {/* Mobile: Card view */}
          <div className="lg:hidden space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(order as any).roomId?.name || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(order as any).waiterId?.name || 'N/A'}
                    </p>
                  </div>
                  <span className={clsx('px-2 py-1 text-xs rounded-full font-medium', getStatusColor(order.status))}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Taomlar:</span>
                      <span className="ml-1 font-medium">{order.items.length} ta</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Jami:</span>
                      <span className="ml-1 font-semibold text-primary-600">{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  {formatDateTime(order.openedAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table view */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Xona</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ofitsiant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Taomlar</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Jami</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Holat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {(order as any).roomId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(order as any).waiterId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.items.length} ta
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-1 text-xs rounded-full', getStatusColor(order.status))}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {formatDateTime(order.openedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {orders.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="font-medium">Buyurtmalar topilmadi</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary text-sm px-3 py-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary text-sm px-3 py-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
