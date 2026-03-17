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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buyurtmalar</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">Barcha holatlar</option>
          <option value="open">Ochiq</option>
          <option value="closed">Yopilgan</option>
          <option value="cancelled">Bekor qilingan</option>
        </select>
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="card overflow-hidden">
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
                <tr key={order._id}>
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
      )}

      {orders.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          Buyurtmalar topilmadi.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            Oldingi
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Keyingi
          </button>
        </div>
      )}
    </div>
  );
}
