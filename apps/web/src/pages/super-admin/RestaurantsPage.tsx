import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminApi } from '../../services/api';
import { formatDateShort } from '@repo/utils';
import { PLAN_LABELS } from '@repo/constants';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import type { Restaurant } from '@repo/types';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, [search]);

  const loadRestaurants = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;

      const { data } = await superAdminApi.getRestaurants(params);
      setRestaurants(data.restaurants);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (restaurant: Restaurant) => {
    if (!confirm(`"${restaurant.name}" restoranini o'chirishni tasdiqlaysizmi?\n\nBu amalni ortga qaytarib bo'lmaydi! Barcha ma'lumotlar (menyu, xonalar, ofitsiantlar, buyurtmalar) o'chiriladi.`)) {
      return;
    }

    setDeleting(restaurant._id);
    try {
      await superAdminApi.deleteRestaurant(restaurant._id);
      toast.success('Restoran o\'chirildi');
      setRestaurants(restaurants.filter(r => r._id !== restaurant._id));
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restoranlar</h1>
        <Link to="/super-admin/restaurants/new" className="btn-primary">
          + Yangi restoran
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          className="input max-w-md"
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nomi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarif</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Muddat</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Holat</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id} className={clsx(!restaurant.isActive && 'opacity-50')}>
                  <td className="px-4 py-3 font-medium text-gray-900">{restaurant.name}</td>
                  <td className="px-4 py-3 text-gray-600">{restaurant.slug}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {PLAN_LABELS[restaurant.subscription.plan]}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDateShort(restaurant.subscription.expiresAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 text-xs rounded-full',
                      restaurant.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {restaurant.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      to={`/super-admin/restaurants/${restaurant._id}`}
                      className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                    >
                      Ko'rish
                    </Link>
                    <button
                      onClick={() => handleDelete(restaurant)}
                      disabled={deleting === restaurant._id}
                      className={clsx(
                        'text-sm text-red-600 hover:text-red-800 hover:underline',
                        deleting === restaurant._id && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {deleting === restaurant._id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {restaurants.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          Restoranlar topilmadi.
        </div>
      )}
    </div>
  );
}
